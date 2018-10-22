from flask import Flask
app = Flask(__name__)


import praw as pr

from client import client_secret, client_id, agent

reddit = pr.Reddit(client_id=client_id,
                     client_secret=client_secret,
                     user_agent=agent)

def random():
	subreddit = reddit.subreddit('random')
	return 'r/' + subreddit.display_name

@app.route('/')
def hello_world():
    return random()
