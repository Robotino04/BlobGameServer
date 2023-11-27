select
    place
from
    (
        /* add the place as a row*/
        SELECT
            row_number() OVER (
                ORDER BY
                    score DESC
            ) place,
            *
        FROM
            scoreboard
    )
WHERE
    user_id = ?
ORDER BY
    submission_time DESC
LIMIT
    1;