const dbconn = require('../model/dbconn');

module.exports.AverageEarnings = function (scholar) {
        // Calculate days since employment
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const empDate = new Date(scholar.start_date);
        const Difference_In_Time = lastDayOfMonth.getTime() - empDate.getTime();
        const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
        // Calculate avg. earning
        const totalEarning = scholar.total_earning / Math.floor(Difference_In_Days);
        const totalEarningPerDay = Math.round(totalEarning * 10) / 10;
        return totalEarningPerDay;
}

function ScholarRankings() {
    const sqlSelect = "SELECT * FROM scholar";
    var scholarList = new Array();
    dbconn.conn.query(sqlSelect, (err, result) => {
        if(err) throw err;
        result.forEach(scholar => {
            let newscholar = {
                username : scholar.username,
                avg_earning : scholar.avg_earning,
                manager_idmanager : scholar.manager_idmanager
            }
            scholarList.push(newscholar);
        });
    })
    return scholarList;
}
module.exports.scholarRankingsList = ScholarRankings(); 

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
module.exports.calc = calc;

function createDate() {
    today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //As January is 0.
    var yyyy = today.getFullYear(); 
    const noTimeDate = dd+'-'+mm+'-'+yyyy+'-';
    return noTimeDate;
}
module.exports.createDate = createDate();