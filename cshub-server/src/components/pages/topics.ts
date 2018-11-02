import {Request, Response} from "express";

import {app, logger} from "../../";

import {PostVersionRequest, TopicsCallBack, TopicsRequest} from "../../../../cshub-shared/api-calls";
import {getTopicTree} from "../../utilities/topics-utils";
import {DatabaseResultSet, query} from "../../utilities/database-connection";

app.post(TopicsRequest.getURL, (req: Request, res: Response) => {

    const topicsRequest = req.body as TopicsRequest;

    query(`
        SELECT version
        FROM cacheversion
        WHERE type = "TOPICS"
    `)
        .then((versionData: DatabaseResultSet) => {
            const version = versionData.getNumberFromDB("version");

            if (version !== topicsRequest.topicVersion || topicsRequest.topicVersion === -1) {
                const topics = getTopicTree();
                topics
                    .then((result) => {
                        if (result === null) {
                            logger.error(`No topics found`);
                            res.status(500).send();
                        } else {
                            res.json(new TopicsCallBack(result, version));
                        }
                    });
            } else {
                res.json(new TopicsCallBack());
            }
        })


});
