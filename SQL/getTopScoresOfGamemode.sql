SELECT
    DENSE_RANK() OVER (
        ORDER BY
            score DESC
    ) place,
    *
FROM
    scoreboard
WHERE
    gamemode = ?
ORDER BY
    place ASC
LIMIT
    ?, ?;