# By Suryaveer @IIT indore
# GITHUB: https://github.com/surya-veer
# Handle: ayrusreev

import warnings
warnings.filterwarnings("ignore")
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from textblob import TextBlob
from sklearn.externals import joblib
import re

# give IS_TRAIN as True when traning is needed            
IS_TRAIN = False

class Split:
        
        """This class is for spliting data into individual words and lemmatistion of words."""
        
        def into_tokens(self,msg):
            return TextBlob(msg).words

        def into_lemmas(self,message):
            words = TextBlob(message).words
            # for each word, take its "base form" = lemma 
            return [word.lemma for word in words]

class Train:

        """Traning and testing our model."""
        
        def __init__(self):
            self.clf = MultinomialNB()
            
        def train(self,x,y):
            self.clf.fit(x,y)
            
        def score(self,x,y):
            return self.clf.score(x,y)
        
        def test(self,y):
            return self.clf.predict(y)
        
        def accuracy(self,x,y):
            acc = accuracy_score(x,y,normalize=False)
            print('accuracy', acc)
            return acc
        def probability(self,x):
            prob = self.clf.predict_proba(x)
            return prob

# Only for formating text in terminal 
class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

if(IS_TRAIN==True):

    print("Preparing traning data...\n")

    df = pd.read_csv('./data/SMSSpamCollection' , sep='\t' , names=['status', 'message'])

    df['length'] = df['message'].map(lambda msg:len(msg))

    #calling Split object
    split = Split()


    vectorizer = CountVectorizer(analyzer=split.into_lemmas)
    X = vectorizer.fit_transform(df['message'])
    bag_of_words = vectorizer.fit_transform(df['message'])


    tfidf_transformer = TfidfTransformer()
    tfidf = tfidf_transformer.fit_transform(bag_of_words)


    df.loc[df["status"]=='ham',"status"]=1
    df.loc[df["status"]=='spam',"status"]=0
    df['status'] = df['status'].astype('int')


    X = tfidf
    Y = df['status']

    # Data spliting for cross validation 
    X_train, X_test, Y_train, Y_test = train_test_split(X,Y,test_size=.01)

    #Traning our model
    print("Training model...\n")
    clf = Train()
    clf.train(X,Y)

    # Saving vectorizer and model because it is not necessay to train model everytime
    print("Saving model...\n")
    joblib.dump(clf, 'data/model.pkl')
    joblib.dump(vectorizer,'data/vectorizer.pkl')


print(bcolors.OKGREEN + 'Loading vectorizer and model...\n' +bcolors.ENDC)
clf = joblib.load('data/model.pkl') 
vectorizer = joblib.load('data/vectorizer.pkl')

def parse(message):
    pat = '((.|\n)*)Inboxx((.|\n)*)\)to((.|\n)*)Reply ForwardClick(.|\n)*'   
    g = re.search(pat,message)
    try:
        return g[1],g[5]
    except:
        return "True","True"

def predict_in(message):
    subject,message = parse(message)
    print(bcolors.OKBLUE + message[:100] + bcolors.ENDC)
    X = vectorizer.transform([message])
    prob = clf.probability(X)
    output = 'spam'
    if(clf.test(X)):
        output = 'ham'
    return output,clf.probability(X),subject
