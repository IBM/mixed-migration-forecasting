import { backGroundColors } from '../chartColors';
const options = {
  aspectRatio: 5,
  scales: {
    xAxes: [
      {
        stacked: false,
      },
    ],
    yAxes: [
      {
        stacked: false,
        ticks: {
          beginAtZero: true,
          max: 1100,
        },
      },
    ],
  },
};

//Bar chart by age
const splitString = (stringToSplit, separator) => {
  return stringToSplit.split(separator);
};
const setNumForAgeArray = (number, array) => {
  if (number < 10) {
    array[0]++;
  }
  if (number > 10 && number < 20) {
    array[1]++;
  }
  if (number > 20 && number < 40) {
    array[2]++;
  }
  if (number > 40) {
    array[3]++;
  }
};
export const getBarDataByAge = (data = [], age, country) => {
  const tempObject = {};
  let joinedArray = [];
  const finalData = {
    labels: ['Age 0-9', 'Age 10-19', 'Age 20-39', 'Age 40+'],
    datasets: [],
  };

  if (data) {
    data
      .filter(el => el[age] !== '' && el[country] !== '')
      .forEach(el => {
        el['Victim Age'] = isNaN(
          parseInt(splitString(el[age].toString(), '--')[1]),
        )
          ? parseInt(el[age])
          : parseInt(splitString(el[age], '--')[1]);
        if (!tempObject[el.Country]) {
          tempObject[el.Country] = {
            label: el.Country,
            data: [0, 0, 0, 0],
          };
          setNumForAgeArray(el['Victim Age'], tempObject[el.Country].data);
        } else {
          setNumForAgeArray(el['Victim Age'], tempObject[el.Country].data);
        }
      });
    Object.keys(tempObject).forEach((el, index) => {
      tempObject[el].backgroundColor = backGroundColors[index];
      tempObject[el].borderColor = backGroundColors[index];
      tempObject[el].borderWidth = 1;
      finalData.datasets.push(tempObject[el]);
      joinedArray.push(...tempObject[el].data);
    });
    finalData.options = options;
    finalData.options.scales.yAxes[0].ticks.max =
      Math.ceil((Math.max(...joinedArray) + 1) / 10) * 10 +
      Math.ceil((Math.max(...joinedArray) + 1) / 10);
  }
  return finalData;
};
