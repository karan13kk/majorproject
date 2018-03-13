var { connection } 	= require('../dbSetup/database.js');
var { revGenreMap } = require('../mapping.js');
var reportCalculation = {
	 allUserError : function(){
	 	let Value = 0;
		connection.getConnection(function(err,data){
		if(err){
				console.log(err);
			}else{
				var sql = "SELECT * FROM userfeature";
				data.query(sql,function(err,result){
					if(err){
						console.log(err);
					}else{
						let index = 0;
						let ratingDifference = 0;
						let total = 0;
						checkError(result,index,ratingDifference,total)
					}
				});
				data.release();
			}
		});
	}
}

function checkError(info,index,ratingDifference,total){
	if(info.length == index){
		console.log("RMSE : ");
		console.log(Math.sqrt(ratingDifference/total));
	}else{
		console.log("CALLED GET AVG");
		var dataArr = [];
		connection.getConnection(function(err,data){
		if(err){
				console.log(err);
			}else{
				var sql = "SELECT users.FEATURE,movierating.RATING , users.RATING AS URating FROM `movierating` INNER JOIN users on movierating.MOVIE_ID = users.MOVIE_ID WHERE users.USER_ID = "+info[index].USER_ID;
				data.query(sql,function(err,result){
					if(err){
						console.log(err);
					}else{
						calculation(result,info,index,ratingDifference,total);
					}
				});
			}
			data.release();
		});
	}
}

function calculation(completeInfo,info,index,ratingDifference,total){
	var userInfo;
	userInfo = info[index];
	completeInfo.forEach(function(val){
		var predicted		=	findFactors(val.FEATURE,val.RATING,userInfo);
		var avgRating		=	val.RATING;
		var predictedRating =	avgRating * 0.48 + predicted * 0.52;
		ratingDifference	+= Math.abs((predictedRating - val.URating)*(predictedRating - val.URating)/25);
	});
	total += completeInfo.length;
	index = index+1;
	checkError(info,index,ratingDifference,total)
}


function findFactors(remainder,RATING,userInfo){
	var ratingTotal = 0;
	var calculatedValue = 0;
	var count = 0;
	for (i = 2; i <= remainder; i++) {
		while ((remainder % i) === 0) {
			var mappingVal = revGenreMap[i];
			if(userInfo[""+mappingVal] != 0){
				count++;
				ratingTotal += userInfo[""+mappingVal];
			}else{
				ratingTotal += RATING;
				count++;
			}
			remainder /= i;
		}
	}
	var calculatedValue = Math.round(ratingTotal*100/count)/100;
	return calculatedValue;
}

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

module.exports  = reportCalculation;