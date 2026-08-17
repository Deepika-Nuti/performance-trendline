export function buildFairnessInputs(normalizedRows: any[], ctx: any): any {
  // We evaluate for Gender, but also check the others to generate details.
  const checkColumn = (col: string) => {
    const hasColumn = normalizedRows.some(r => r.raw[col] !== undefined);
    if (!hasColumn) return { status: 'not_available', reason: \equires \ column to be present\ };
    const groups = new Set<string>();
    const groupStats: Record<string, { total: number; favorable: number }> = {};
    let totalCount = 0;
    
    for (const row of normalizedRows) {
      const groupVal = row.raw[col];
      if (groupVal !== undefined && groupVal !== '') {
        groups.add(groupVal);
        if (!groupStats[groupVal]) groupStats[groupVal] = { total: 0, favorable: 0 };
        groupStats[groupVal].total++;
        totalCount++;
        const issue = row.raw['Type of issue'] || row.raw['type of issue'] || '';
        const isBiased = String(issue).toLowerCase().includes('biased');
        if (!isBiased) groupStats[groupVal].favorable++;
      }
    }

    if (groups.size < 2) return { status: 'not_available', reason: \only one group present for '\' in this batch — cannot compare\ };
    
    let allFavorable = true;
    let allUnfavorable = true;
    for (const stat of Object.values(groupStats)) {
      if (stat.favorable > 0) allUnfavorable = false;
      if (stat.favorable < stat.total) allFavorable = false;
    }
    if (allUnfavorable || allFavorable) return { status: 'not_available', reason: 'no variance in outcome — every row flagged with an issue type' };
    
    let privilegedGroup = Array.from(groups)[0];
    let unprivilegedGroup = Array.from(groups)[1];
    
    if (col === 'Gender') {
      if (groups.has('Male')) privilegedGroup = 'Male';
      unprivilegedGroup = Array.from(groups).filter(g => g !== privilegedGroup).sort((a, b) => groupStats[b].total - groupStats[a].total)[0];
    } else {
      const sorted = Array.from(groups).sort((a, b) => groupStats[b].total - groupStats[a].total);
      privilegedGroup = sorted[0];
      unprivilegedGroup = sorted[1];
    }
    
    const privTotal = groupStats[privilegedGroup].total;
    const privSelected = groupStats[privilegedGroup].favorable;
    const unprivTotal = groupStats[unprivilegedGroup].total;
    const unprivSelected = groupStats[unprivilegedGroup].favorable;
    
    const details: any = { privilegedGroup, unprivilegedGroup, privTotal, privSelected, unprivTotal, unprivSelected };
    if (privTotal < 10 || unprivTotal < 10) details.warning = \Low sample size (Privileged: \, Unprivileged: \). Results may not be statistically significant.\;
    return { status: 'available', inputs: { unprivSelected, unprivTotal, privSelected, privTotal, details } };
  };

  const genderResult = checkColumn('Gender');
  const otherColumns = ['Disability', 'Religion/Belief', 'Sexual Orientation', 'Age Group'];
  const otherStatuses: Record<string, string> = {};
  
  for (const col of otherColumns) {
    const res = checkColumn(col);
    otherStatuses[col] = res.status === 'available' ? 'Available' : res.reason;
  }
  
  if (genderResult.status !== 'available') {
    return { status: 'not_available', reason: genderResult.reason, details: { otherColumns: otherStatuses } };
  }
  
  genderResult.inputs.details.otherColumns = otherStatuses;
  return genderResult;
}
