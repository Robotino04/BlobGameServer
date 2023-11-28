SELECT
    DENSE_RANK() OVER (
        ORDER BY
            score DESC
    ) place,
    *
FROM
    scoreboard
ORDER BY
    place ASC
LIMIT
    ?, ?;