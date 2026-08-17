const protectedColumns = ['Gender', 'Disability', 'Religion/Belief', 'Sexual Orientation', 'Age Group'];
const fairnessMetrics = protectedColumns.flatMap(col => [
  {
    id: \statistical-parity-difference-\\,
    name: \Statistical Parity Difference (\)\,
    description: \Measures the gap in selection rates between groups for \.\,
    category: 'Fairness',
    implementation: (inputs: any) => {
      const value = calculateSPD(inputs.unprivSelected, inputs.unprivTotal, inputs.privSelected, inputs.privTotal);
      return { value, details: inputs.details };
    },
    inputBuilder: (rows: any, ctx: any) => buildFairnessInputs(rows, ctx, col),
    type: 'group/aggregate'
  },
  {
    id: \disparate-impact-\\,
    name: \Disparate Impact (\)\,
    description: \Ratio of favorable-outcome rates between unprivileged and privileged groups for \.\,
    category: 'Fairness',
    implementation: (inputs: any) => {
      const value = calculateDI(inputs.unprivSelected, inputs.unprivTotal, inputs.privSelected, inputs.privTotal);
      return { value, details: inputs.details };
    },
    inputBuilder: (rows: any, ctx: any) => buildFairnessInputs(rows, ctx, col),
    type: 'group/aggregate',
    higherIsBetter: true
  }
]);

console.log("Fairness metrics defined.");
