const fs = require('fs');
const path = require('path');


const writeToCSV = (data) => {
    const headers = 'Time,Projectid,Projectname,Projectwithhours\n';
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}.${currentDate.getMonth() + 1}.${currentDate.getFullYear()}`;
    const logFileName = `log_${formattedDate}.csv`;
    const logFilePath = path.join(__dirname, '..', logFileName);

    if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, headers);
    }

    const dataString = `${data.Time},${data.Projectid},${data.Projectname},${data.date}\n`;

    fs.appendFileSync(logFilePath, dataString);
}

module.exports = { writeToCSV };
