sleep 3
kill `ps -ef|grep 'triangulurTrade'|grep -v 'grep'|awk '{print $2}'`
#sleep 1
#nohup node /root/work/cashcow/depthWriter.js >> /root/work/cashcow/dw.log&
nohup node /root/work/cashcow/triangulurTrade.js >> /root/work/cashcow/tt.log&

