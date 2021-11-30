import React from "react";

import { router } from "dva";
import { Route } from "@reco-m/core-ui";

import { FilesManage } from "./files.manage";
import { FilesSubpage } from "./files.subpage";
import { FilesPreview } from "./files.preview";
import { FileItem } from "./files.item";

export { FilesManage, FilesSubpage, FilesPreview, FileItem };

export function filesRoutes(match: router.match): React.ReactNode {
    return (
        <Route
            path={`${match.path}/file`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={FilesManage.Page} />
                    <Route
                        path={`${match.path}/fileSubList/:id/:fileName`}
                        render={({ match }) => (
                            <>
                                <Route path={match.path} component={FilesSubpage.Page} />
                                <router.Switch>
                                    {fileSubListRoute({ match })}
                                    {filePreviewRoute({ match })}
                                </router.Switch>
                            </>

                        )}
                    />
                    {filePreviewRoute({ match })}
                </>
            )}
        />
    );
}

export const filePreviewRoute = ({ match }) => <Route path={`${match.path}/preview`} component={FilesPreview.Page} />;

export const fileSubListRoute = ({ match }) => (
    <Route
        path={`${match.path}/:id/:fileName`}
        render={({ match }) => (
            <>
                <Route path={match.path} component={FilesSubpage.Page} />
                <router.Switch>
                    {filePreviewRoute({ match })}
                    {fileSubListRoute({ match })}
                </router.Switch>
            </>
        )}
    />
);
