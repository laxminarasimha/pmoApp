var gon = {};
gon["holiday"] = "2017-06-26,2017-06-27".split(",");

// 2 helper functions - moment.js is 35K minified so overkill in my opinion
function pad(num) { return ("0" + num).slice(-2); }
function formatDate(date) { var d = new Date(date), dArr = [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())];return dArr.join('-');}

function calculateDays(first,last) {
  var aDay = 24 * 60 * 60 * 1000,
  daysDiff = parseInt((last.getTime()-first.getTime())/aDay,10)+1;

  if (daysDiff>0) {  
    for (var i = first.getTime(), lst = last.getTime(); i <= lst; i += aDay) {
      var d = new Date(i);
      if (d.getDay() == 6 || d.getDay() == 0 // weekend
      || gon.holiday.indexOf(formatDate(d)) != -1) {
          daysDiff--;
      }
    }
  }
  return daysDiff;
}

// ONLY using jQuery here because OP already used it. I use 1.11 so IE8+

$(function() {
    var days = calculateDays(new Date($('#startDateID').val()),
                             new Date($('#endDateID').val()));
    if (days <= 0) {
      alert("Please enter an end date after the begin date");
    }
    else {
      alert(days +" working days found");
	  if (days) document.getElementById("numberOfLeaves").innerHTML = days;
       $("#numberOfLeaves").val(days);
    }
});