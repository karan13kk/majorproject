const fs 	= require('fs');
const csv 	= require("fast-csv");
var { connection } = require('../dbSetup/database.js');
var { genreMap, revGenreMap } = require('../mapping.js');

var readcsv = {
	 readmoviecsv : function(){
		var movies 			= fs.readFileSync('../../../ml-latest-small/MediumData/movies.dat','utf8');
		var moviesArray 	= movies.split('\n');
		var feature;
		var moviesArrayList 	= [];
		moviesArray.splice(0, 1);
		moviesArray.splice(moviesArray.length-1, 1);

		moviesArray.forEach(function(movie){
			var subMovieArray 	= movie.match(/(?:[^\::"]+|"[^"]*")+/g);
			var movieArray = [];
			if(subMovieArray[2]){
				var genres 			= subMovieArray[2].split('|');
				var feature			= 1;
				genres.forEach(function(genre){
					feature *= genreMap[genre.replace(/(\r\n|\n|\r)/gm,"")];
				});
			}
			movieArray.push(parseInt(subMovieArray[0]));
			movieArray.push(feature);
			moviesArrayList.push(movieArray);
		});
		insertMovieData(moviesArrayList);
	},
	readratingcsv : function(){
		var feature;
		var moviesArrayList 	= [];

		var dataResult = [];
		connection.getConnection(function(err,data){
			if(err){
				console.log(err);
			}else{
				var sql = "select * from movierating";
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
	}
}

function readFile(dataResult){
	var mappingFeature = {};
	var ratingsArrayList = [];
	dataResult.forEach(function(val){
		mappingFeature[""+val.MOVIE_ID] = val.FEATURE;
	});
	csv
	 .fromPath("../../../ml-latest-small/MediumData/ratings.csv")
	 .on("data", function(data){
	     // console.log(data);
	     if(ratingsArrayList.length>40000){
			insertFeatureData(ratingsArrayList);
			ratingsArrayList = [];
		}
	     mergeData(data,mappingFeature,ratingsArrayList);
	 })
	 .on("end", function(){
	 	insertFeatureData(ratingsArrayList);
	    console.log("done");
	 });
}

function mergeData(subratingArray,mappingFeature,ratingsArrayList){
	let ratingArray 		= [];
	if(parseInt(subratingArray[0])){
		ratingArray.push(parseInt(subratingArray[0]));
		ratingArray.push(parseInt(subratingArray[1]));
		ratingArray.push(parseFloat(subratingArray[2]));
		ratingArray.push(parseInt(mappingFeature[""+subratingArray[1]]));
		ratingsArrayList.push(ratingArray);
	}else{
		console.log("ERRRORORORORORORORORORRR ________________" + JSON.stringify(subratingArray))
	}
}

//=======================//
// DATABASE INSERT QUERY //
//=======================//

// Movie Table
function insertMovieData(info){
	connection.getConnection(function(err,data){
		if(err){
			console.log(err);
		}else{
			var sql = "INSERT INTO movierating (MOVIE_ID,FEATURE) VALUES ?"
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

// User Table
function insertFeatureData(info){
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