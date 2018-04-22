var { connection } = require('../dbSetup/database.js');

var { genreMap } = require('../mapping.js');
var { revGenreMap } = require('../mapping.js');


var learningModule = {
	learning : function(){
		let usersArray = [];
		connection.getConnection(function(err,data){
			if(err){
				console.log(err);
			}else{
				var sql = "SELECT DISTINCT(USER_ID) from users";
				data.query(sql,function(err,result){
					if(err){
						console.log(err);
					}else{
						console.log(result);
						var completeCountArray 	= [];
						var completeRatingArray = [];
						var completeRatingAvgArray = [];
						training(result,0,result.length,completeCountArray,completeRatingArray,completeRatingAvgArray);
					}
				});
				data.release();
			}
		});
	}
}

function training(usersArray,index,length,completeCountArray,completeRatingArray,completeRatingAvgArray){
	console.log(index + " : " +length);
	if(index<length){
		featureSort(usersArray,index,length,completeCountArray,completeRatingArray,completeRatingAvgArray);
	}else{
		console.log('done');
	}
}

function featureSort(usersArray,index,length,completeCountArray,completeRatingArray,completeRatingAvgArray){
	const userGenreMapIndex = {2 : 1, 3 : 2, 5 : 3, 7 : 4, 11 : 5, 13 : 6, 17 : 7, 19 : 8, 23 : 9, 29 : 10, 31 : 11, 37 : 12, 41 : 13, 43 : 14, 47 : 15, 53 : 16, 59 : 17, 61 : 18, 67 : 19, 71 : 20};
	
	const userGenreCount	= [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	
	const userRatingMap 	= [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

	const userRatingAvgMap 	= [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	connection.getConnection(function(err,data){
	if(err){
			console.log(err);
		}else{
			var id = usersArray[index].USER_ID;
			// console.log(id);
			var sql = "SELECT * from users WHERE USER_ID = "+id+" ORDER BY MOVIE_ID ASC";
			data.query(sql,function(err,result){
				if(err){
					console.log(err);
				}else{
					for(var i = 0; i<=result.length*0.7; i++){ // PICKING OUT ONLY 70% OF USER DATA
						findFactors(result[i].FEATURE,userGenreCount,userRatingMap,result[i].RATING,userGenreMapIndex);
					}
					for (var i = 0; i < userGenreCount.length; i++) {
						if(userGenreCount[i]>0)
						userRatingAvgMap[i] = userRatingMap[i]/userGenreCount[i];
					}
					userGenreCount.splice(0, 0, id);
					completeCountArray.push(userGenreCount);
					userRatingMap.splice(0, 0, id);
					completeRatingArray.push(userRatingMap);
					userRatingAvgMap.splice(0, 0, id);
					completeRatingAvgArray.push(userRatingAvgMap);
					index += 1;
					if(completeRatingAvgArray.length>0){
						userFeature(completeCountArray,completeRatingArray,userGenreMapIndex);
						completeCountArray 	= [];
						completeRatingArray = [];
						completeRatingAvgArray =[];
						training(usersArray,index,length,completeCountArray,completeRatingArray,completeRatingAvgArray);
					}else{
						training(usersArray,index,length,completeCountArray,completeRatingArray,completeRatingAvgArray);
					}
				}
			});
			data.release();
		}
	});
}

function findFactors(remainder,userGenreCount,userRatingMap,rating,userGenreMapIndex){
	for(var i in userGenreMapIndex){
		if(remainder > 1 && remainder%i == 0 ){
			userGenreCount[userGenreMapIndex[i]-1] += 1;
			userRatingMap[userGenreMapIndex[i]-1] += rating;
			remainder /= i;
		}
	}
}

function userFeature(completeCountArray,completeRatingArray,userGenreMapIndex){
	// var ratingInfo 	= completeRatingArray;
	// var countInfo	= completeCountArray;
	connection.getConnection(function(err,data){
	if(err){
			console.log(err);
		}else{
			var queryString = "USER_ID";
			for(var key in userGenreMapIndex){
				if(!revGenreMap[key]){
					console.log(key)
				}
				queryString += ","+revGenreMap[key];
			}
			var sql = "INSERT INTO userfeaturecount ("+queryString+") VALUES ?";
			data.query(sql,[completeCountArray],function(err,result){
				if(err){
					console.log(err);
				}else{
					
					console.log(result);
				}
			});
			var sql = "INSERT INTO userfeaturerating ("+queryString+") VALUES ?";
			data.query(sql,[completeRatingArray],function(err,result){
				if(err){
					console.log(err);
				}else{
					
					console.log(result);
				}
			});
			data.release();
		}
	});
}

module.exports  = learningModule;