SELECT
    COUNT(*)
FROM
    scoreboard s1
WHERE
    s1.score >= (
        SELECT
            MAX(s2.score)
        FROM
            scoreboard s2
        WHERE
            s2.gamemode = s1.gamemode
            AND s2.user_id = s1.user_id
            AND s2.submission_time <= s1.submission_time
    );