import React from "react";

import { NavBar, SearchBar, Accordion, Flex, List, Radio, WhiteSpace } from "antd-mobile-v2";

import { ViewComponent } from "@reco-m/core-ui";

import { SearchFooter } from "./searchFooter";

export namespace SideBarContent {
    export interface IProps extends ViewComponent.IProps {
        searchKey?: string;
        typeTitle?: string;
        rightTitle?: string;
        tags?: any;
        selectedTagID?: number;
        onChange?(type: any);
        resetSearch?();
        sureSearch?();
        tagOnChange?(data: any);
    }

    export interface IState extends ViewComponent.IState { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
            } as any;
        }
        renderSideBarContent(): React.ReactNode {
            const { typeTitle, rightTitle, tags, selectedTagID, tagOnChange } = this.props;

            return (
                <div className="container-fill container-scrollable">
                    <Accordion accordion defaultActiveKey="0" className="collect-accordion">
                        <Accordion.Panel
                            header={
                                <Flex>
                                    <Flex.Item>{typeTitle || ""}</Flex.Item>
                                    <span className="accordion-result">{rightTitle || ""}</span>
                                </Flex>
                            }
                        >
                            <List>
                                {tags &&
                                    tags.length > 0 &&
                                    tags.map((tag: any, i: number) => (
                                        <Radio.RadioItem key={i} checked={selectedTagID === i} onChange={() => tagOnChange && tagOnChange({ tag: tag, i: i })}>
                                            {tag.tagName || tag.catalogueName}
                                        </Radio.RadioItem>
                                    ))}
                            </List>
                        </Accordion.Panel>
                    </Accordion>
                </div>
            );
        }

        render(): React.ReactNode {
            const { onChange, resetSearch, sureSearch, searchKey } = this.props;
            return (
                <div className="drawer-detail">
                    <div className="container-column container-fill">
                        {client.showheader && <NavBar className="park-nav">筛选</NavBar>}

                        <SearchBar
                            placeholder="搜索"
                            value={searchKey !== null ? searchKey : ""}
                            className="consultsearch"
                            onChange={value => onChange && onChange({ type: "input", data: { searchKey: value } })}
                        />
                        <WhiteSpace />
                        {this.renderSideBarContent()}
                        <SearchFooter.Component reset={resetSearch && resetSearch.bind(this)} sureSearch={sureSearch && sureSearch.bind(this)} />
                    </div>
                </div>
            );
        }
    }
}
