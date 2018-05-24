/**
 * Created by q.fu on 07.05.2018.
 */
var fs = require('fs');
var inputFile = "", outputFile = "";
process.argv.forEach(function (val, index, array) {
    //console.log(index + ': ' + val);
    if (index == 2)
        inputFile = val;
    else if (index == 3)
        outputFile = val;
});
console.log("input:" + inputFile);
console.log("output:" + outputFile);

fs.readFile(inputFile, function read(err, ds) {
    if (err) {
        throw err;
    }
    var hasR = false;
    var dss = ds.toString();
    if (dss.indexOf("\r") > 0) {
        hasR = true;
        console.log("has r");
    }

    ds = dss.replace(/\r/g, "");
    var ss = ds.split("\n");
    var startCopy = false;
    var insertStr = "", numre = /^\-?\d+$|^\-?\d+\.\d+$|^\-?\d+\.\d+[e]{1}\-{1}\d+$/g;

    for (var i = 0, ii = ss.length; i < ii; i++) {
        if (startCopy) {
            if (ss[i].indexOf("\\\.") == 0) {
                startCopy = false;
                insertStr = "";
            } else {
                //ss[i] = "(" + ss[i].replace(/\t/g, ",") + ")";
                var pss = ss[i].split("\t");
                for (var j = 0, jj = pss.length; j < jj; j++) {
                    var pstr = '' + pss[j].trim();
                    pstr = pstr.replace(/\t/g, "");
                    if (pstr.length > 0) {
                        var te = numre.test(pstr);
                        numre.test(pstr);
                        if (pstr.indexOf("\\N") == 0) {
                            pss[j] = "NULL";
                        } else if (te) {
                            //console.log("j:" + j + "; value:" + pstr + "; test:" + te);
                        }
                        else {
                            pss[j] = "'" + pstr + "'";
                        }
                    } else {
                        pss[j] = "''";
                    }
                }
                ss[i] = insertStr + " (" + pss.join(',') + ");";
                if (hasR)
                    ss[i] = ss[i] + "\r\n";
                else
                    ss[i] = ss[i] + "\n";
                fs.appendFileSync(outputFile, ss[i]);
            }
        } else {
            if (ss[i].indexOf("COPY") == 0) {
                startCopy = true;
                ss[i] = ss[i].replace("COPY", "INSERT INTO");
                ss[i] = ss[i].replace("FROM stdin;", "VALUES");
                insertStr = ss[i];
            } else {
                if (hasR)
                    ss[i] = ss[i] + "\r\n";
                else
                    ss[i] = ss[i] + "\n";
                fs.appendFileSync(outputFile, ss[i]);
            }
        }

    }
});
