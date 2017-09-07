#! /bin/sh
dir=/ice/

if [ ! -d "/var/log/ice" ]; then
    mkdir /var/log/ice
fi

logPath=/var/log/ice
foreverlog=$logPath/ice-forever.log
consoleLog=$logPath/ice.log
consoleErrLog=$logPath/ice-err.log

main_file=/server/server.js
export NODE_ENV=production \
&& forever start -m 5 -l $foreverlog -o $consoleLog -e $consoleErrLog -a -p $dir --sourceDir $dir --workingDir $dir \
$main_file -watchDirectory -colors

tail -f $logPath/ice-forever.log
