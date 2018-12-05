#!/bin/sh
sleep 2
proc_name="depthWriter"  #进程名
file_name="/root/work/cashcow/rst.log"
pid=0
proc_num() 
{
  num=`ps -ef | grep $proc_name | grep -v grep | wc -l` 
  #echo 'in proc', $num >> $file_name      # 将新进程号和重启时间记录  
  return $num 
}
proc_id()
{  
    pid=`ps -ef | grep $proc_name | grep -v grep | awk '{print $2}'`  
}
#reset
kill `ps -ef|grep 'depthWriter'|grep -v 'grep'|awk '{print $2}'` 
proc_num
number=$?  
echo $number
if [ $number -eq 0 ]                                    # 判断进程是否存在  
then
    echo 'no cashcow' >> $file_name      # 将新进程号和重启时间记录  
    cd /root/work/cashcow/; 
    echo 'cd into cashcow' >> $file_name      # 将新进程号和重启时间记录  
    #nohup mongod --auth --dbpath /var/lib/mongodb >> /root/work/cashcow/db.log& #./restart_db.sh -DZone    # 重启进程的命令
    nohup /usr/local/bin/node /root/work/cashcow/depthWriter.js >> /root/work/cashcow/dw.log&
    echo 'after run depth' >> $file_name      # 将新进程号和重启时间记录  
    proc_id                                         # 获取新进程号  
    echo $proc_name, ${pid}, `date` >> $file_name      # 将新进程号和重启时间记录
fi  
