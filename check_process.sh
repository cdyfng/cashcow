#!/bin/sh
proc_name="mongod"  #进程名
file_name="/root/work/cashcow/rst.log"
pid=0
proc_num() 
{
  num=`ps -ef | grep $proc_name | grep -v grep | wc -l` 
  return $num 
}
proc_id()
{  
    pid=`ps -ef | grep $proc_name | grep -v grep | awk '{print $2}'`  
} 
proc_num
number=$?  
echo $number
if [ $number -eq 0 ]                                    # 判断进程是否存在  
then   
    cd /root/work/cashcow/; 
    nohup mongod -port 54398 --dbpath /var/lib/mongodb >> /root/work/cashcow/db.log& #./restart_db.sh -DZone    # 重启进程的命令
    #nohup mongod -port 54398 --auth --dbpath /var/lib/mongodb >> /root/work/cashcow/db.log& #./restart_db.sh -DZone    # 重启进程的命令
    proc_id                                         # 获取新进程号  
    echo ${pid}, `date` >> $file_name      # 将新进程号和重启时间记录  
fi  
