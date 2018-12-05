#!/bin/sh
sleep 4 
file_name="/root/work/cashcow/rst.log"
/usr/local/bin/pm2 restart 0 1 
echo 'restart bfxClass' >> $file_name 
