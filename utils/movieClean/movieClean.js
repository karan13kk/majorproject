const fs 	= require('fs');
const csv 	= require("fast-csv");
var { connection } = require('../dbSetup/database.js');

var readcsv = {
	 readcsv : function(){
		var movies 			= fs.readFileSync('../../../ml-latest-small/Data/movies.csv','utf8');
		var moviesArray 	= movies.split('\n');
		var feature;
		var moviesArrayList 	= [];
		// moviesArray.splice(0, 1);
		// moviesArray.splice(moviesArray.length-1, 1);

		// ratingsArray.splice(0, 1);
		// ratingsArray.splice(ratingsArray.length-1, 1);

		// moviesArray.forEach(function(movie){
		// 	var subMovieArray 	= movie.split(',');
		// 	var movieArray = [];
		// 	if(subMovieArray[2]){
		// 		var genres 			= subMovieArray[2].split('|');
		// 		var feature			= 1;
		// 		genres.forEach(function(genre){
		// 			feature *= genreMap[genre.replace(/(\r\n|\n|\r)/gm,"")];
		// 		});
		// 	}
		// 	movieArray.push(parseInt(subMovieArray[0]));
		// 	movieArray.push(feature);
		// 	moviesArrayList.push(movieArray);
		// });
		// insertData(moviesArrayList);
		var dataResult = [];
		connection.getConnection(function(err,data){
			if(err){
				console.log(err);
			}else{
				var sql = "select * from movies";
				data.query(sql,function(err,result){
					if(err){
						console.log(err);
					}else{
						console.log(result.length);
						dataResult = result;
						readFile(dataResult)
					}
				});	
				data.release();
			}
		});
		// getFeature(ratingsArrayList);
	}
}

function readFile(dataResult){
	var mappingFeature = {};
	var ratingsArrayList = [];
	dataResult.forEach(function(val){
		mappingFeature[""+val.MOVIE_ID] = val.FEATURE;
	});
	csv
	 .fromPath("../../../ml-latest/ratings.csv")
	 .on("data", function(data){
	     // console.log(data);
	     if(ratingsArrayList.length>40000){
			insertData(ratingsArrayList);
			ratingsArrayList = [];
		}
	     mergeData(data,mappingFeature,ratingsArrayList)
	 })
	 .on("end", function(){
	 	insertData(ratingsArrayList);
	    console.log("done");
	 });
}

function mergeData(subratingArray,mappingFeature,ratingsArrayList){
	let ratingArray 		= [];
	ratingArray.push(parseInt(subratingArray[0]));
	ratingArray.push(parseInt(subratingArray[1]));
	ratingArray.push(parseFloat(subratingArray[2]));
	ratingArray.push(parseInt(mappingFeature[""+subratingArray[1]]));
	ratingsArrayList.push(ratingArray);
}

//=======================//
// DATABASE INSERT QUERY //
//=======================//

// Movie Table
// function insertData(info){
// 	connection.getConnection(function(err,data){
// 		if(err){
// 			console.log(err);
// 		}else{
// 			var sql = "INSERT INTO movies (MOVIE_ID,RATING,FEATURE) VALUES ?"
// 			data.query(sql,[info],function(err,result){
// 				if(err){
// 					console.log(err);
// 				}else{
// 					console.log(result);
// 				}
// 			});
// 			data.release();
// 		}
// 	});
// }

// User Table
function insertData(info){
	connection.getConnection(function(err,data){
		if(err){
			console.log(err);
		}else{
			var sql = "INSERT INTO users (USER_ID,MOVIE_ID,RATING,FEATURE) VALUES ?"
			data.query(sql,[info],function(err,result){
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
module.exports  = readcsv;