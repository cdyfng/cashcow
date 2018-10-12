import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn import tree
from sklearn import svm, preprocessing, linear_model
from sklearn.utils import shuffle
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

# to do list: 
# check file, read the update data 
# process the data ,generate X and y
# learn 
# predict the next price 


file = './depths.csv'
data_df =pd.read_csv(file)
data_df.columns = ['exchange', 'datetime', 'symbol', 'dog', 
'side', 'warning', 'threshold0', 'threshold1', 'threshold2',
'ask_price_0', 'ask_amount_0', 'bid_price_0', 'bid_amount_0', 
'ask_price_1', 'ask_amount_1', 'bid_price_1', 'bid_amount_1', 
'ask_price_2', 'ask_amount_2', 'bid_price_2', 'bid_amount_2', 
'ask_price_3', 'ask_amount_3', 'bid_price_3', 'bid_amount_3', 
'ask_price_4', 'ask_amount_4', 'bid_price_4', 'bid_amount_4', ]


 #v1 = {Pask, Vask, Pbid, Vbid} , i=1->n

 #Time-insensitive Set
 #v2 ={(Pask −Pbid),(Pask +Pbid)/2}n ,
data_df['V2_0_0'] = data_df.ask_price_0 - data_df.bid_price_0
data_df['V2_1_0'] = (data_df.ask_price_0 + data_df.bid_price_0)/2
data_df['V2_0_1'] = data_df.ask_price_1 - data_df.bid_price_1
data_df['V2_1_1'] = (data_df.ask_price_1 + data_df.bid_price_1)/2
data_df['V2_0_2'] = data_df.ask_price_2 - data_df.bid_price_2
data_df['V2_1_2'] = (data_df.ask_price_2 + data_df.bid_price_2)/2
data_df['V2_0_3'] = data_df.ask_price_3 - data_df.bid_price_3
data_df['V2_1_3'] = (data_df.ask_price_3 + data_df.bid_price_3)/2
data_df['V2_0_4'] = data_df.ask_price_4 - data_df.bid_price_4
data_df['V2_1_4'] = (data_df.ask_price_4 + data_df.bid_price_4)/2

#V3 ={Pask −Pask,Pbid −Pbid,|Pask −Pask|,|Pbid −Pbid|}n , 3 n 1 1 n i+1 i i+1 i i=1
#price differences
data_df['V3_0_0'] = data_df.ask_price_1 - data_df.ask_price_0
data_df['V3_0_1'] = data_df.ask_price_2 - data_df.ask_price_0
data_df['V3_0_2'] = data_df.ask_price_3 - data_df.ask_price_0
data_df['V3_0_3'] = data_df.ask_price_4 - data_df.ask_price_0

data_df['V3_1_0'] = data_df.bid_price_0 - data_df.bid_price_1
data_df['V3_1_1'] = data_df.bid_price_0 - data_df.bid_price_2
data_df['V3_1_2'] = data_df.bid_price_0 - data_df.bid_price_3
data_df['V3_1_3'] = data_df.bid_price_0 - data_df.bid_price_4

data_df['V3_2_0'] = data_df.ask_price_2 - data_df.ask_price_1
data_df['V3_2_1'] = data_df.ask_price_3 - data_df.ask_price_2
data_df['V3_2_2'] = data_df.ask_price_4 - data_df.ask_price_3

data_df['V3_3_0'] = data_df.bid_price_1 - data_df.bid_price_2
data_df['V3_3_1'] = data_df.bid_price_2 - data_df.bid_price_3
data_df['V3_3_2'] = data_df.bid_price_3 - data_df.bid_price_4

#V4 {1 􏰄n Pask, 1 􏰄n Pbid, 1 􏰄n Vask, 1 􏰄n Vbid}, 4 n i=1 i n i=1 i n i=1 i n i=1 i
#mean prices and volumes
data_df['V4_0_0'] = (data_df.ask_price_0 + data_df.ask_price_1 + data_df.ask_price_2 
	+ data_df.ask_price_3 +data_df.ask_price_4)/5
data_df['V4_1_0'] = (data_df.bid_price_0 + data_df.bid_price_1 + data_df.bid_price_2 
	+ data_df.bid_price_3 +data_df.bid_price_4)/5
data_df['V4_2_0'] = (data_df.ask_amount_0 + data_df.ask_amount_1 + data_df.ask_amount_2 
	+ data_df.ask_amount_3 +data_df.ask_amount_4)/5
data_df['V4_3_0'] = (data_df.bid_amount_0 + data_df.bid_amount_1 + data_df.bid_amount_2 
	+ data_df.bid_amount_3 +data_df.bid_amount_4)/5

#V5 v ={􏰄n (Pask −Pbid), 􏰄n (Vask −Vbid)},
#accumulated differences
data_df['V5_0_0'] = data_df.ask_price_0 - data_df.bid_price_0 + data_df.ask_price_1 - data_df.bid_price_1 + data_df.ask_price_2 - data_df.bid_price_2 + data_df.ask_price_3 - data_df.bid_price_3 + data_df.ask_price_4 - data_df.bid_price_4 
data_df['V5_1_0'] = data_df.ask_amount_0 - data_df.bid_amount_0 + data_df.ask_amount_1 - data_df.bid_amount_1 + data_df.ask_amount_2 - data_df.bid_amount_2 + data_df.ask_amount_3 - data_df.bid_amount_3 + data_df.ask_amount_4 - data_df.bid_amount_4 

#V6 



#get difference from mean price
def f(x):
 if(x==0):
  return 0
 elif(x>0):   
  return 1
 else:
  return -1

data_df['NextDayDiff'] = (data_df['V2_1_0'].shift(-1) - data_df['V2_1_0']).map(lambda x: f(x))


#data_df['Difference'].map(lambda x: f(x))

print(data_df.head())
print(data_df.tail())


def try_different_method(clf, plt, x_train, y_train, x_test, y_test):
    clf.fit(x_train, y_train)
    score = clf.score(x_test, y_test)
    result = clf.predict(x_test)
    # plt.figure()
    print(result)
    print(y_test)
    print('train X number:', len(x_train))
    print('test X number:', len(x_test))
    print('predict status: ', set(result))
    print('right status: ', set(y_test))
    check_direction = result
    print(len(check_direction[check_direction > 0]),
          len(check_direction[check_direction < 0]),
          len(check_direction[check_direction == 0]))
    correct_count = 0
    for x in range(len(y_test)):
        if result[x] == y_test[x]:
            correct_count += 1
            
    print('correct rate: ', correct_count/test_size)
    # plt.plot(np.arange(len(result)), y_test, 'go-', label='true value')
    # plt.plot(np.arange(len(result)), result, 'ro-', label='predict value')
    # plt.title('score: %f' % score)
    # plt.legend()
    # plt.show()


#generate a close_price :  mean price of bid0 and ask0
#generate a difference of each tomorrow - day
#process X
#get y
#learn 
#predict the rise or fall 
features = ['V2_0_0', 'V2_1_0', 'V2_0_1', 'V2_1_1', 'V2_0_2', 'V2_1_2', 'V2_0_3', 'V2_1_3', 'V2_0_4', 'V2_1_4',
	'V3_0_0', 'V3_0_1', 'V3_0_2', 'V3_0_3', 'V3_1_0', 'V3_1_1', 'V3_1_2', 'V3_1_3', 'V3_2_0', 'V3_2_1', 'V3_2_2',
	'V3_3_0', 'V3_3_1', 'V3_3_2', 'V4_0_0', 'V4_1_0', 'V4_2_0', 'V4_3_0', 'V5_0_0', 'V5_1_0']

data_df = shuffle(data_df)
X = data_df[features]
X = preprocessing.scale(X)
#X = data_df[features].values
y = data_df.NextDayDiff.values 
#y = data_df.GainDiff.values
test_size = 10000
# Tree
#tree_reg = tree.DecisionTreeRegressor()
tree_clf = tree.DecisionTreeClassifier(criterion='entropy', max_depth=10)
forest_tree_clf = RandomForestClassifier(n_estimators=200, criterion='entropy', max_depth=4)

try_different_method(forest_tree_clf, plt, X[:-test_size],
                     y[:-test_size], X[-test_size:], y[-test_size:])




