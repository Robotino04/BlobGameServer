import http.client
import json
import time


def get_discord_tokens():
    conn = http.client.HTTPConnection("localhost", 5173)

    # get exchange_token
    headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
    }

    payload = ""

    conn.request("GET", "/api/game/request_token", payload, headersList)
    response = conn.getresponse()
    result = response.read()

    result_json = json.loads(result.decode("utf-8"))

    import webbrowser

    webbrowser.open(
        f'http://localhost:5173/api/game/auth?state={result_json["exchange_token"]}',
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
        conn = http.client.HTTPConnection("localhost", 5173)
        conn.request("POST", "/api/game/request_token", payload, headersList)
        response = conn.getresponse()
        result = response.read()
        if response.status != 202:
            break

        time.sleep(0.1)

    print(response.status)
    print(result.decode("utf-8"))
    return response


get_discord_tokens()
