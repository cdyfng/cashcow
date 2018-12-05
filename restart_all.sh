

forever stop /root/work/cashcow/exchange/okcoin-ws/ok.js
forever stop /root/work/cashcow/exchange/bfxClass.js
#sleep 1
sleep 1
###kill `ps -ef|grep 'mongod'|grep -v 'grep'|awk '{print $2}'`
#sleep 1
#node /root/work/cashcow/depthWriter.js >> /root/work/cashcow/dw.log&
###sleep 1
###nohup mongod --dbpath /var/lib/mongodb >> /root/work/cashcow/mongodb.log&
###nohup mongod --auth --dbpath /var/lib/mongodb >> /root/work/cashcow/mongodb.log&

#forever stop /root/work/cashcow/exchange/bfxClass.js
forever start /root/work/cashcow/exchange/bfxClass.js
##kill `ps -ef|grep 'bfxClass'|grep -v 'grep'|awk '{print $2}'`
##nohup node /root/work/cashcow/exchange/bfxClass.js >> /root/work/cashcow/bfxClass.log&

sleep 1
#forever stop /root/work/cashcow/exchange/okcoin-ws/ok.js
forever start /root/work/cashcow/exchange/okcoin-ws/ok.js
##kill `ps -ef|grep 'okcoin'|grep -v 'grep'|awk '{print $2}'`
##nohup node /root/work/cashcow/exchange/okcoin-ws/ok.js >> /root/work/cashcow/ok.log&
#forever restart /Users/fong/work/nodejs/cashcowBTCETH/cashcow.js
#sleep 1
#kill `ps -ef|grep 'depthWriter'|grep -v 'grep'|awk '{print $2}'`
#sleep 1
#nohup node /root/work/cashcow/depthWriter.js >> /root/work/cashcow/dw.log&




