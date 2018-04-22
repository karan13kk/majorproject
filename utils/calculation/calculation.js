var fs = require('fs');
var { connection } 	= require('../dbSetup/database.js');
var { revGenreMap } = require('../mapping.js');
var reportCalculation = {
	 allUserError : function(){
	 	let Value = 0;
	 	let ratingDifference = [];
		connection.getConnection(function(err,data){
		if(err){
				console.log(err);
			}else{
				var sql = "SELECT * FROM userfeaturerating ORDER BY USER_ID ASC";
				data.query(sql,function(err,result){
					if(err){
						console.log(err);
					}else{
						console.log(result.length)
						let index = 0;
						let total = 0;
						let info = result;
						for (var i = 0; i < 100; i++) {
							ratingDifference[i] = 0;
						}
						// ratingDifferenceTemp = 0;
						console.log(JSON.stringify(ratingDifference));
						getCount(info,index,ratingDifference,total);
					}
				});
				data.release();
			}
		});
	}
}

function getCount(info,index,ratingDifference,total){
	connection.getConnection(function(err,data){
		if(err){
				console.log(err);
		}else{
			var sql = "SELECT * FROM userfeaturecount ORDER BY USER_ID ASC";
			data.query(sql,function(err,result){
				if(err){
					console.log(err);
				}else{
					console.log(result.length);
					checkError(result,info,index,ratingDifference,total)
				}
			});
			data.release();
		}
	});
}

function checkError(infocount,info,index,ratingDifference,total){
	console.log(index);
	if(info.length == index){
		var date 		= new Date();
		var datetime	= date.toISOString();
		fs.writeFile('./utils/report/rmsehundredk.csv', "theta1,theta2,rmse\n",function(err){
			if(err)
				console.log(err)
			else{
				console.log(ratingDifference);
				console.log("RMSE : ");
				for (var i = 0; i < 100; i++) {
					var theta1  = (i+1)/100;
					var theta2  = 1-theta1;
					var rmse 	= Math.sqrt(ratingDifference[i]/total);
					fs.appendFileSync('./utils/report/rmsehundredk.csv', ""+theta1+","+theta2+","+rmse+"\n");
					console.log("Theta1 : "+theta1);
					console.log("Theta2 : "+theta2);
					console.log(rmse);
				}
			}
		});
	}else{
		// console.log("CALLED GET AVG");
		var dataArr = [];
		connection.getConnection(function(err,data){
		if(err){
				console.log(err);
			}else{
				var sql = "SELECT users.FEATURE,movierating.RATING , users.RATING AS URating FROM `movierating` INNER JOIN users on movierating.MOVIE_ID = users.MOVIE_ID WHERE users.USER_ID = "+info[index].USER_ID+" ORDER BY users.MOVIE_ID DESC";
				data.query(sql,function(err,result){
					if(err){
						console.log(err);
					}else{
						// console.log("CALCULATION")
						calculation(result,infocount,info,index,ratingDifference,total);
					}
				});
				data.release();
			}
		});
	}
}

function calculation(completeInfo,infocount,info,index,ratingDifference,total){
	var userInfo;
	userInfo = info[index];
	countInfo = infocount[index];
	var lengthTotal = 0;
	// console.log(completeInfo.length);
	for (var i = 0 ; i < completeInfo.length; i++) {
		var val 			= completeInfo[i];
		var predicted		=	findFactors(val.FEATURE,val.RATING,userInfo,countInfo);
		if(val.RATING != 0)
			var avgRating		=	val.RATING;
		else
			var avgRating		=	predicted;
		// console.log("AVG RATING : "+avgRating+"		predicted : "+predicted);
		if(!predicted)
			console.log(val);
		for (var j = 0; j < 100; j++) {
			var predictedRating =	Math.round((((avgRating * j) + (predicted * (100-j)))/100)*2)/2;
			var calculated 		= Math.abs(predictedRating - val.URating);
			// console.log(calculated);
			ratingDifference[j] += ((calculated*calculated)/25);
			// if(calculated ==0)
				// ratingDifference[j] += 1;
			// if(calculated==0){
			// 	ratingDifference	+= 1;
			// }
			if(!ratingDifference[j]){
				console.log("RATING DIFFERENCE ERROR AT : "+ j + " ALSO AT : " +i);
			}
		}
		lengthTotal++;
		// console.log(JSON.stringify(ratingDifference));
	}
	total += lengthTotal;
	index = index+1;
	checkError(infocount,info,index,ratingDifference,total);
}


function findFactors(remainder,RATING,userInfo,countInfo){
	var ratingTotal = 0;
	var calculatedValue = 0;
	var count = 0;
	for (i = 2; i <= remainder; i++) {
		if ((remainder % i) === 0) {
			var mappingVal = revGenreMap[i];
			if(userInfo[""+mappingVal] != 0){
				count++;
				if(countInfo[""+mappingVal]==0){
					console.log("HERE IS THE CAUSE : "+mappingVal);
					console.log("HERE IS THE CAUSE1 : "+userInfo[""+mappingVal]);
					console.log("HERE IS THE CAUSE2 : "+countInfo[""+mappingVal]);
					console.log(countInfo);
				}
				ratingTotal += userInfo[""+mappingVal]/countInfo[""+mappingVal];
			}else{
				ratingTotal += RATING;
				count++;
			}
			remainder /= i;
		}
	}
	if(ratingTotal == 0){
		calculatedValue = 2.5;
	}else{
		calculatedValue = Math.round(ratingTotal*100/count)/100;
	}
	return calculatedValue;
}

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

module.exports  = reportCalculation;