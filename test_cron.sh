
forever restart /root/work/cashcow/exchange/bfxClass.js
sleep 1
forever restart /root/work/cashcow/exchange/okcoin-ws/ok.js
sleep 1
#kill `ps -ef|grep 'depthWriter'|grep -v 'grep'|awk '{print $2}'`
#sleep 1
#node /root/work/cashcow/depthWriter.js >> /root/work/cashcow/dw.log&

#forever restart /root/work/cashcow/exchange/bfxClass.js
#forever restart /root/work/cashcow/exchange/okcoin-ws/ok.js
#forever restart /Users/fong/work/nodejs/cashcowBTCETH/cashcow.js
