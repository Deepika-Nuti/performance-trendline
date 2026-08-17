const fs = require('fs');
let content = fs.readFileSync('src/services/evaluation/adapter.ts', 'utf8');

// Replace row-level execution loop
content = content.replace(
  /let sum = 0;\s*let count = 0;\s*for \(const input of buildResult\.inputs\) {[\s\S]*?if \(typeof val === 'number' && isFinite\(val\)\) {\s*sum \+= val;\s*count\+\+;\s*}\s*}[\s\S]*?if \(count > 0\) {[\s\S]*?result\.value = sum \/ count;\s*} else {[\s\S]*?}/,
  `let sum = 0;
      let count = 0;
      let sumDetails: any = null;

      for (const input of buildResult.inputs) {
        let val;
        if (['rouge-n', 'rouge-l', 'rouge-s'].includes(metricDefinition.id)) {
            const rougeMatch = metricDefinition.id.match(/rouge-(.)/);
            const n = rougeMatch ? (rougeMatch[1] === 'n' ? 1 : undefined) : undefined;
            const res = n !== undefined 
                ? metricDefinition.implementation(input.candidate, input.reference, n)
                : metricDefinition.implementation(input.candidate, input.reference);
            val = res?.f1; 
        } else if (input.h !== undefined && input.r !== undefined) {
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
      } else {
        result.status = 'not_available';
        result.reason = 'No valid numeric outputs produced from row-level evaluation.';
      }`
);

fs.writeFileSync('src/services/evaluation/adapter.ts', content, 'utf8');
