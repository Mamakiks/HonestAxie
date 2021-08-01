const dbconn = require('../model/dbconn');
const axios = require('axios').default;

function AverageEarnings(start_date, total_earning) {
    // Calculate days since employment
    const empDate = new Date(start_date);
    const dateNow = new Date();
    const Difference_In_Time = dateNow.getTime() - empDate.getTime();
    const Difference_In_Days = (Difference_In_Time / (1000 * 3600 * 24)) + 1;
    // Calculate avg. earning
    const totalEarning = total_earning / Math.floor(Difference_In_Days);
    const totalEarningPerDay = Math.round(totalEarning * 10) / 10;
    return totalEarningPerDay;
}

function ScholarRankings(onResultCallback) {
    const sqlSelect = "SELECT * FROM scholar";
    return new Promise(function (resolve, reject) { 
        dbconn.conn.query(sqlSelect, (err, result) => {
            if(err) return onResultCallback(err);  
            let scholarList = new Array();
            result.forEach(scholar => {
                let newscholar = {
                    username : scholar.username,
                    avg_earning : scholar.avg_earning,
                    manager_idmanager : scholar.manager_idmanager
                }
                scholarList.push(newscholar);
            });       
            resolve(scholarList.sort((b, a) => (a.avg_earning > b.avg_earning) ? 1 : -1));
        })  
    }) 
}

function ScholarRankingsLastMonth(onResultCallback) {
    const sqlSelect = "SELECT * FROM scholar";
    return new Promise(function (resolve, reject) { 
        dbconn.conn.query(sqlSelect, (err, result) => {
            if(err) return onResultCallback(err);  
            let scholarList = new Array();
            result.forEach(scholar => {
                let newscholar = {
                    username : scholar.username,
                    last_month_earning : scholar.last_month_earning,
                    manager_idmanager : scholar.manager_idmanager
                }
                scholarList.push(newscholar);
            });       
            resolve(scholarList.sort((b, a) => (a.last_month_earning > b.last_month_earning) ? 1 : -1));
        })  
    }) 
}

function calc(last_month_earning, scholar_cut, valueusd, valuedkk) {
    // Scholar Cut
    const susd = Math.round(last_month_earning * scholar_cut / 100 * valueusd),
        sdkk = Math.round(last_month_earning * scholar_cut / 100 * valuedkk),
        sslp = Math.round(last_month_earning * scholar_cut / 100),
        // Manager Cut
        musd = Math.round(last_month_earning * (100 - scholar_cut) / 100 * valueusd),
        mdkk = Math.round(last_month_earning * (100 - scholar_cut) / 100 * valuedkk),
        mslp = Math.round(last_month_earning * (100 - scholar_cut) / 100)
    return [ susd, sdkk, sslp, musd, mdkk, mslp ];
}

function createDate() {
    today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //As January is 0.
    var yyyy = today.getFullYear(); 
    const noTimeDate = dd+'-'+mm+'-'+yyyy+'-';
    return noTimeDate;
}

function checkApostrophe(data) { // Remove Apostrophe from string
    const newData = data;
    const regex = /'/g; // Regular expression to remove all occurences of '
    for(const key of Object.keys(newData)) {
        var str = newData[key];
        if(typeof str === 'string')
            if(str.includes("'")) newData[key] = str.replace(regex, "");

    }
    return newData;
}

/* (async () => {

	const url = `https://axieinfinity.com/`;

	const axiosResponse = await axios.get(url);

	console.log('axiosResponse', axiosResponse.data, axiosResponse.status);


})(); */

module.exports.AverageEarnings = AverageEarnings;
module.exports.rankings = async() => { return await ScholarRankings() };
module.exports.rankingsLastMonth = async() => { return await ScholarRankingsLastMonth() };
module.exports.scholarRankingsList = ScholarRankings(); 
module.exports.calc = calc;
module.exports.createDate = createDate();
module.exports.checkApostrophe = checkApostrophe;







