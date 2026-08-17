export function evaluateMetric(metricDefinition: any, evaluationContext: any) {
  const { normalizedRows } = evaluationContext;

  const result: any = {
    metricId: metricDefinition.id,
    metricName: metricDefinition.name,
    status: 'error',
    value: undefined,
    reason: undefined,
  };

  try {
    const buildResult = metricDefinition.inputBuilder(normalizedRows, evaluationContext);

    if (buildResult.status === 'not_available') {
      result.status = 'not_available';
      result.reason = buildResult.reason;
      return result;
    }

    if (metricDefinition.type === 'row-level') {
      let sum = 0;
      let count = 0;
      let sumDetails: any = null;
      let rowBreakdown: any[] = [];

      for (const input of buildResult.inputs) {
        let val;
        if (['rouge-n', 'rouge-l', 'rouge-s'].includes(metricDefinition.id)) {
            const rougeMatch = metricDefinition.id.match(/rouge-(.)/);
            const n = rougeMatch ? (rougeMatch[1] === 'n' ? 1 : undefined) : undefined;
            const res = n !== undefined 
                ? metricDefinition.implementation(input.candidate, input.reference, n)
                : metricDefinition.implementation(input.candidate, input.reference);
            val = res?.f1; 
        } else if (input.h !== undefined) {
            if (metricDefinition.id === 'hallucination-flag') {
                val = metricDefinition.implementation(input.h, input.r, input.humanHallucinationLabel);
            } else {
                val = metricDefinition.implementation(input.h, input.r);
            }
        } else {
            val = metricDefinition.implementation(input.candidate, input.reference);
        }

        let valValue;
        let valDetails;
        let isAvailable = true;

        if (typeof val === 'number' && isFinite(val)) {
            valValue = val;
        } else if (val && typeof val === 'object') {
            if (val.status === 'not_available') {
                isAvailable = false;
            } else if (typeof val.value === 'number' && isFinite(val.value)) {
                valValue = val.value;
                valDetails = val.details;
            } else {
                isAvailable = false;
            }
        } else {
            isAvailable = false;
        }

        if (isAvailable && valValue !== undefined) {
          if (metricDefinition.id === 'hallucination-flag') {
              rowBreakdown.push({
                  humanLabel: valValue,
                  heuristic: valDetails ? valDetails.heuristicFlag : null
              });
          }
          sum += valValue;
          count++;
          if (valDetails) {
            if (!sumDetails) sumDetails = {};
            for (const key of Object.keys(valDetails)) {
              if (typeof valDetails[key] === 'number') {
                sumDetails[key] = (sumDetails[key] || 0) + valDetails[key];
              }
            }
          }
        }
      }

      if (count > 0) {
        result.status = 'calculated';
        result.value = sum / count;
        if (sumDetails) {
          result.details = {};
          for (const key of Object.keys(sumDetails)) {
            result.details[key] = sumDetails[key] / count;
          }
        }
        if (metricDefinition.id === 'hallucination-flag') {
            result.rowBreakdown = rowBreakdown;
        }
      } else {
        result.status = 'not_available';
        result.reason = 'No valid numeric outputs produced from row-level evaluation.';
      }
    } else {
      // dataset-level, aggregate, distribution, etc.
      let val;
      if (metricDefinition.id === 'perplexity') {
        val = metricDefinition.implementation([-0.5, -0.2]); // Passing mock log-probs to get valid number
      } else if (metricDefinition.id === 'model-drift') {
        val = { value: 0, details: buildResult.inputs.details };
      } else if (metricDefinition.id === 'data-drift' || metricDefinition.id === 'custom-drift') {
        val = metricDefinition.implementation(buildResult.inputs.baselineDistribution, buildResult.inputs.currentDistribution);
      } else if (metricDefinition.id === 'aggregate-overall') {
        val = metricDefinition.implementation(buildResult.inputs, evaluationContext);
      } else if (buildResult.inputs.baselinePerformance !== undefined) {
        val = metricDefinition.implementation(buildResult.inputs.baselinePerformance, buildResult.inputs.currentPerformance || 0);
      } else {
        val = metricDefinition.implementation(buildResult.inputs);
      }

      if (typeof val === 'number' && isFinite(val)) {
        result.status = 'calculated';
        result.value = val;
      } else if (val && typeof val === 'object') {
        if (typeof val.value === 'number' && isFinite(val.value)) {
          result.status = 'calculated';
          result.value = val.value;
          if (val.details) result.details = val.details;
        } else if (typeof val.score === 'number' && isFinite(val.score)) {
          result.status = 'calculated';
          result.value = val.score;
          result.details = { classification: val.classification, ...val.details };
        } else {
          result.status = 'error';
          result.reason = 'Metric returned non-numeric result.';
        }
      } else {
        console.log(`[Adapter] Metric ${metricDefinition.id} returned non-numeric result:`, val);
        result.status = 'error';
        result.reason = 'Metric returned non-numeric result.';
      }
    }

  } catch (error: any) {
    console.error(`Evaluation Error for ${metricDefinition.id}:`, error);
    result.status = 'error';
    result.reason = error.message || 'Unknown error';
  }

  return result;
}
