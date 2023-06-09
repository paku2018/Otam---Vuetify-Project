const sortDate = (date: string) => {
  if (date === "" || date == undefined) {
    return "Not specified";
  }
  const month = changeMonthType(date);
  const separatedDate = date.split("-").reverse();
  separatedDate.splice(1, 1, month);
  const refactoredDate = `${separatedDate[0]} ${separatedDate[1]}, ${separatedDate[2]} `;
  return refactoredDate;
};

const changeMonthType = (date: string) => {
  const month = date.split("-")[1];
  if (month === "01") {
    return "January";
  } else if (month === "02") {
    return "February";
  } else if (month === "03") {
    return "March";
  } else if (month === "04") {
    return "April";
  } else if (month === "05") {
    return "May";
  } else if (month === "06") {
    return "June";
  } else if (month === "07") {
    return "July";
  } else if (month === "08") {
    return "August";
  } else if (month === "09") {
    return "September";
  } else if (month === "10") {
    return "October";
  } else if (month === "11") {
    return "November";
  } else {
    return "December";
  }
};
export { sortDate };
