sleep 3
kill `ps -ef|grep 'depthWriter'|grep -v 'grep'|awk '{print $2}'`
#sleep 1
#nohup node /root/work/cashcow/depthWriter.js >> /root/work/cashcow/dw.log&
nohup node /root/work/cashcow/depthWriter.js >> /root/work/cashcow/dw.log&

