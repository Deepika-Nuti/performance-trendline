const fs = require('fs');

let c = fs.readFileSync('tests/evaluation/engine.test.ts', 'utf8');

const equalityTest = `
  it('Benchmark Equality Test: Governance Composites are wired to real formulas', async () => {
    const batch = [
      { candidate: 'A', reference: 'B' }
    ];

    const runResult = await runEvaluation('gov-dataset', batch);
    
    // Check that governance metrics are now 'calculated' and have details
    const biasIndexResult = runResult.metricResults['bias-index'];
    expect(biasIndexResult?.status).toBe('calculated');
    expect((biasIndexResult as any)?.details?.DIR).toBeDefined();

    const mitigationResult = runResult.metricResults['bias-mitigation'];
    expect(mitigationResult?.status).toBe('calculated');
    expect((mitigationResult as any)?.details?.mitigationEfficacyIndex).toBeDefined();

    // Log the bias-index details for the user to see
    require('fs').writeFileSync('details_dump.log', JSON.stringify((biasIndexResult as any).details, null, 2));
  });
`;

c = c.replace(/it\('Should correctly output the expected mix of calculated and not_available for a plain QA upload'/g, equalityTest + "\n  it('Should correctly output the expected mix of calculated and not_available for a plain QA upload'");

// We also need to fix the QA upload test: the 6 governance metrics are now 'calculated', not 'not_available'!
// In the original QA upload test:
c = c.replace(/'bias-mitigation', 'bias-index', 'privacy-integrity', 'provenance-completeness', 'auditability-level', 'compliance-adaptability',/g, '');
c = c.replace(/'accuracy', 'row-overall'/g, "'accuracy', 'row-overall', 'bias-mitigation', 'bias-index', 'privacy-integrity', 'provenance-completeness', 'auditability-level', 'compliance-adaptability'");

fs.writeFileSync('tests/evaluation/engine.test.ts', c);
console.log('Added governance benchmark test!');
