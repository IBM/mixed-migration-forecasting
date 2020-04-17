export const chartDataGenerate = (data, settingsObj) => {
  const dataSet = [settingsObj];
  if (data && data.length) {
    data.forEach(el => {
      if (!el || !Object.keys(el).length) return;
      (dataSet[0]['y'] || dataSet[0]['values']).push(el.value);
      (dataSet[0]['x'] || dataSet[0]['labels']).push(el.year);
    });
  }
  return dataSet;
};
