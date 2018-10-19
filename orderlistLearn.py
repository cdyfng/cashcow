import pandas as pd
import numpy as np
#import matplotlib.pyplot as plt
from sklearn import tree
from sklearn import svm, preprocessing, linear_model
from sklearn.utils import shuffle
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier

# to do list:
# check file, read the update data
# process the data ,generate X and y
# learn
# predict the next price


def init_features(data_df):
         # v1 = {Pask, Vask, Pbid, Vbid} , i=1->n
         # Time-insensitive Set
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
    # price differences
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
    data_df['V4_0_0'] = (data_df.ask_price_0 + data_df.ask_price_1 + data_df.ask_price_2
                         + data_df.ask_price_3 + data_df.ask_price_4)/5
    data_df['V4_1_0'] = (data_df.bid_price_0 + data_df.bid_price_1 + data_df.bid_price_2
                         + data_df.bid_price_3 + data_df.bid_price_4)/5
    data_df['V4_2_0'] = (data_df.ask_amount_0 + data_df.ask_amount_1 + data_df.ask_amount_2
                         + data_df.ask_amount_3 + data_df.ask_amount_4)/5
    data_df['V4_3_0'] = (data_df.bid_amount_0 + data_df.bid_amount_1 + data_df.bid_amount_2
                         + data_df.bid_amount_3 + data_df.bid_amount_4)/5
    # accumulated differences
    data_df['V5_0_0'] = data_df.ask_price_0 - data_df.bid_price_0 + data_df.ask_price_1 - data_df.bid_price_1 + \
        data_df.ask_price_2 - data_df.bid_price_2 + data_df.ask_price_3 - \
        data_df.bid_price_3 + data_df.ask_price_4 - data_df.bid_price_4
    data_df['V5_1_0'] = data_df.ask_amount_0 - data_df.bid_amount_0 + data_df.ask_amount_1 - data_df.bid_amount_1 + data_df.ask_amount_2 - \
        data_df.bid_amount_2 + data_df.ask_amount_3 - \
        data_df.bid_amount_3 + data_df.ask_amount_4 - data_df.bid_amount_4
    return data_df


# V6


# get difference from mean price
def f(x):
    # if(x==0):
    # return 0
    # el
    if(x > 0):
        return 1
    else:
        return -1


def try_different_method(clf, plt, x_train, y_train, x_test, y_test, date_list):
    clf.fit(x_train, y_train)
    score = clf.score(x_test, y_test)
    result = clf.predict(x_test)
    # plt.figure()
    print(result)
    print(y_test)
    print(clf.feature_importances_)
    print('train X number:', len(x_train))
    print('test X number:', len(x_test))
    print('predict status: ', set(result))
    print('right status: ', set(y_test))
    check_direction = result
    print(len(check_direction[check_direction > 0]),
          len(check_direction[check_direction < 0]),
          len(check_direction[check_direction == 0]))
    print(len(y_test[y_test > 0]),
          len(y_test[y_test < 0]),
          len(y_test[y_test == 0]))
    correct = (result == y_test)
    print('correct rate: ', len(correct[correct == True]) * 1.0 / len(correct))
    # same as before, clf.score is the exsit function
    print('score:', clf.score(x_test, y_test))
    # time ask_price_0 ask_amount_0 bid_price_0 bid_amount_0 predict_result
    disp = x_test[['ask_price_0', 'ask_amount_0',
                   'bid_price_0', 'bid_amount_0']]
    disp['predict_result'] = correct.T
    disp['predict'] = result.T
    disp['realY'] = y_test.T
    disp['date'] = date_list
    print('to analyze:\n', disp)
    disp.to_csv("./analyzes.csv")
    # for index, row in disp.iterrows():
    #	print(index, row)

    # correct_count = 0.0
    # for x in range(len(y_test)):
    #     #print(result[x], y_test[x])
    #     if result[x] == y_test[x]:
    #         correct_count += 1
    #
    # print('correct rate: ', correct_count/test_size, correct_count, test_size)
    # plt.plot(np.arange(len(result)), y_test, 'go-', label='true value')
    # plt.plot(np.arange(len(result)), result, 'ro-', label='predict value')
    # plt.title('score: %f' % score)
    # plt.legend()
    # plt.show()


def try_different_method_multioutput(clf, plt, x_train, y_train, x_test, y_test, date_list):
    clf.fit(x_train, y_train)
    #score = clf.score(x_test, y_test)
    result = clf.predict(x_test)
    # plt.figure()
    # print(result)
    # print(y_test)
    # print(clf.feature_importances_)
    print('train X number:', len(x_train))
    print('test X number:', len(x_test))
    # print('predict status: ', set(result))
    # print('right status: ', set(y_test))
    check_direction = result
    print('result:', result)
    disp = x_test[['ask_price_0', 'ask_amount_0',
                   'bid_price_0', 'bid_amount_0']]
    for i in range(len(result[0])):
        correct = (result.T[i] == y_test.T[i])
        print(i, 'correct rate: ', len(
            correct[correct == True]) * 1.0 / len(correct))
        disp['predict' + str(i)] = result[:, i]
    # print(len(check_direction[check_direction > 0]),
    #       len(check_direction[check_direction < 0]),
    #       len(check_direction[check_direction == 0]))
    # print(len(y_test[y_test > 0]),
    #       len(y_test[y_test < 0]),
    #       len(y_test[y_test == 0]))
    # correct = (result == y_test)
    # print('correct rate: ', len(correct[correct==True]) * 1.0/ len(correct))
        # #same as before, clf.score is the exsit function
    # ##print('score:', clf.score(x_test, y_test))
        # # time ask_price_0 ask_amount_0 bid_price_0 bid_amount_0 predict_result
    # disp['predict_result'] = correct.T
    # disp['predict'] = result
    # disp['realY'] = y_test
    disp['date'] = date_list
    print('to analyze:\n', disp)
    disp.to_csv("./analyzes.csv")


# generate a close_price :  mean price of bid0 and ask0
# generate a difference of each tomorrow - day
# process X
# get y
# learn
# predict the rise or fall
file = './depths200k.csv'
#file = './depths10000.csv'
pd.set_option('precision', 8)
data_df = pd.read_csv(file, skiprows=150000)
data_df.columns = ['exchange', 'datetime', 'symbol', 'dog',
                   'side', 'warning', 'threshold0', 'threshold1', 'threshold2',
                   'ask_price_0', 'ask_amount_0', 'bid_price_0', 'bid_amount_0',
                   'ask_price_1', 'ask_amount_1', 'bid_price_1', 'bid_amount_1',
                   'ask_price_2', 'ask_amount_2', 'bid_price_2', 'bid_amount_2',
                   'ask_price_3', 'ask_amount_3', 'bid_price_3', 'bid_amount_3',
                   'ask_price_4', 'ask_amount_4', 'bid_price_4', 'bid_amount_4', ]


data_df = data_df[data_df.symbol == 'ETH/BTC']
data_df = init_features(data_df)
data_df['NextDayDiff'] = (data_df['V2_1_0'].shift(-1) -
                          data_df['V2_1_0']).map(lambda x: f(x))
data_df['NextDayDiff2'] = (
    data_df['V2_1_0'].shift(-2) - data_df['V2_1_0']).map(lambda x: f(x))
data_df['NextDayDiff3'] = (
    data_df['V2_1_0'].shift(-3) - data_df['V2_1_0']).map(lambda x: f(x))
data_df['NextDayDiff4'] = (
    data_df['V2_1_0'].shift(-4) - data_df['V2_1_0']).map(lambda x: f(x))
data_df['NextDayDiff5'] = (
    data_df['V2_1_0'].shift(-5) - data_df['V2_1_0']).map(lambda x: f(x))
#data_df[['ask_price_0', 'V2_1_0', 'NextDayDiff', ]]
#data_df['Difference'].map(lambda x: f(x))

print(data_df.head())
print(data_df.tail())
plt = 0

features = ['ask_price_0', 'ask_amount_0', 'bid_price_0', 'bid_amount_0',
            'ask_price_1', 'ask_amount_1', 'bid_price_1', 'bid_amount_1',
            'ask_price_2', 'ask_amount_2', 'bid_price_2', 'bid_amount_2',
            'ask_price_3', 'ask_amount_3', 'bid_price_3', 'bid_amount_3',
            'ask_price_4', 'ask_amount_4', 'bid_price_4', 'bid_amount_4',
            'V2_0_0', 'V2_1_0', 'V2_0_1', 'V2_1_1', 'V2_0_2', 'V2_1_2', 'V2_0_3', 'V2_1_3', 'V2_0_4', 'V2_1_4',
            'V3_0_0', 'V3_0_1', 'V3_0_2', 'V3_0_3', 'V3_1_0', 'V3_1_1', 'V3_1_2', 'V3_1_3', 'V3_2_0', 'V3_2_1', 'V3_2_2',
            'V3_3_0', 'V3_3_1', 'V3_3_2', 'V4_0_0', 'V4_1_0', 'V4_2_0', 'V4_3_0', 'V5_0_0', 'V5_1_0']


test_size = 1000
#data_df = data_df[-5000:]
#data_df = shuffle(data_df)
#data_df = preprocessing.scale(data_df)
train_df = data_df[:-test_size]
print(train_df[0:1])
print(train_df[-1:])
train_df = shuffle(train_df)
test_df = data_df[-test_size:]
print(test_df[0:1])
print(test_df[-1:])

x_train = train_df[features]
y_train = np.array(zip(train_df.NextDayDiff.values, train_df.NextDayDiff2.values,
                       train_df.NextDayDiff3.values, train_df.NextDayDiff4.values, train_df.NextDayDiff5.values))

x_test = test_df[features]
y_test = np.array(zip(test_df.NextDayDiff.values, test_df.NextDayDiff2.values,
                      test_df.NextDayDiff3.values, test_df.NextDayDiff4.values, test_df.NextDayDiff5.values))
#X = data_df[features].values
#y = data_df.NextDayDiff.values
#y = data_df.GainDiff.values

# Tree
#tree_reg = tree.DecisionTreeRegressor()
tree_clf = tree.DecisionTreeClassifier(criterion='entropy', max_depth=10)
#forest_tree_clf = RandomForestClassifier(n_estimators=200, criterion='entropy', max_depth=4)

multi_output_clf = MultiOutputClassifier(tree_clf)
try_different_method_multioutput(multi_output_clf, plt, x_train,
                                 y_train, x_test, y_test, data_df[-test_size:].datetime)
# try_different_method(tree_clf, plt, X[:-test_size],
#                      y[:-test_size], X[-test_size:], y[-test_size:])

# save model
# predict
