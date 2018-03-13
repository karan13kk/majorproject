const mysql = require('mysql');

var { connection } = require('../dbSetup/database.js');
var { genreMap } = require('../mapping.js');
var { revGenreMap } = require('../mapping.js');


var cleanRatingData = {
	movierating : function(){
		console.log("MOVIE RATING")
		connection.getConnection(function(err,data){
		if(err){
				console.log(err);
			}else{
				var sql = "SELECT MOVIE_ID,AVG(RATING) AS RATING from users GROUP BY MOVIE_ID";
				data.query(sql,function(err,result){
					if(err){
						console.log(err);
					}else{
						var dataFinal = []
						console.log(result);
						result.forEach(function(val){
							var dataVal = [];
							dataVal.push(val.MOVIE_ID);
							dataVal.push(Math.round(val.RATING*100)/100);
							dataFinal.push(dataVal);
						});
						movieratingdb(dataFinal);
					}
				});
				data.release();
			}
		});
	}
}

function movieratingdb(data1){
	connection.getConnection(function(err,data){
	if(err){
			console.log(err);
		}else{
			var sql = "INSERT INTO movierating (MOVIE_ID,RATING) VALUES ?";
			data.query(sql,[data1],function(err,result){
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

module.exports  = cleanRatingData;