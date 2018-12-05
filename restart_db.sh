#!/bin/sh
#ps -ef|grep 'mongod'|grep -v 'grep'|grep -v 'restart'|awk '{print $2}'
#if [ $? -eq 0 ]
#then 
#echo 'running mongod' #>> /root/work/cashcow/db.log
#else
#echo 'should restart mongod' #>> /root/work/cashcow/db.log
nohup mongod --auth --dbpath /var/lib/mongodb >> /root/work/cashcow/db.log&
#fi

