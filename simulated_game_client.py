import requests
import json
import time
import datetime
import random

SCORE_URL = "http://localhost:5173/api/scores"
REQUEST_TOKEN_URL = "http://localhost:5173/api/game/request_token"
AUTH_URL = "http://localhost:5173/api/game/auth"

gamemodes = ["classic", "toasted"]

def get_discord_tokens():
    # get exchange_token
    headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
    }

    payload = ""

    response = requests.request(
        "GET", REQUEST_TOKEN_URL, data=payload, headers=headersList
    )
    result = response.content

    result_json = json.loads(result.decode("utf-8"))

    import webbrowser

    webbrowser.open(
        f'{AUTH_URL}?state={result_json["exchange_token"]}',
        new=2,
    )
    # get tokens

    headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Content-Type": "application/json",
    }

    payload = result.decode("utf-8")

    while True:
        response = requests.request(
            "POST", REQUEST_TOKEN_URL, data=payload, headers=headersList
        )
        result = response.content
        if response.status_code != 202:
            break

        time.sleep(0.1)

    print(response.status_code)
    print(result.decode("utf-8"))
    return json.loads(result.decode("utf-8"))


def post_score(score, access_token, gm):
    headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Content-Type": "application/json",
    }

    payload = json.dumps(
        {
            "discord_access_token": access_token,
            "score": score,
            "time": str(datetime.datetime.now()),
            "gamemode": gm
        }
    )

    response = requests.request("POST", SCORE_URL, data=payload, headers=headersList)
    result = response.content

    print(result.decode("utf-8"))


tokens = get_discord_tokens()
access_token = tokens["access_token"]
for _ in range(1):
    post_score(random.randint(1, 5000), access_token, random.choice(gamemodes))
