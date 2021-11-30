import React from "react";

import { Checkbox, Grid } from "antd-mobile";

import { PureComponent } from "@reco-m/core";
import produce, { Draft } from 'immer';

export namespace TreeMenu {
    export interface IProps extends PureComponent.IProps {
        datas: any | any[];
        onSelected?: (selected: any[]) => void;
        partSelect?: (item: any) => void;
        multiple?: number;
    }

    export interface IState extends PureComponent.IState {
        selected?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends React.Component<P, S> {
        static defaultProps = {
        } as any;

        selected(selected: any) {
            this.setState({
                selected: selected,
            });
            this.props.onSelected!(selected);
        }

        render(): React.ReactNode {
            const { datas, multiple } = this.props as any;

            let { selected } = this.state || [];
            return (
                <div className="tree-list">
                    {datas instanceof Array ? (
                        datas.map((d, i) => (
                            <div className="tree-list" key={i}>
                                <TreeNode
                                    datas={d}
                                    onSelected={this.selected.bind(this)}
                                    selected={selected || []}
                                    index={i}
                                    key={i}
                                    multiple={multiple}
                                    partSelect={(item) => this.props.partSelect && this.props.partSelect(item)}
                                />
                            </div>
                        ))
                    ) : (
                        <TreeNode
                            datas={datas}
                            onSelected={this.selected.bind(this)}
                            selected={selected || []}
                            index={0}
                            key={0}
                            multiple={multiple}
                            partSelect={(item) => this.props.partSelect && this.props.partSelect(item)}
                        />
                    )}
                </div>
            );
        }
    }

    interface CellRendererProps {
        data: any;
        index: number;
        multiple?: number;
        selected: any[];
        onExpand?: (item: any) => void;
        partSelect?: (item: any) => void;
        onSelected?: (selected: any[]) => void;
    }

    class CellRenderer extends React.Component<CellRendererProps, any> {
        contain(items: any, item: any) {
            return item && items.filter((i) => i && i.key === item.key).length > 0;
        }

        click(dept: any) {
            let { multiple, selected } = this.props;

            let data: any = [];
            if (multiple === 1) {
                // 多选
                if (this.contain(selected, dept)) {
                    data = dept ? selected.filter((item) => item && item.key !== dept.key) : selected;
                } else {
                    data = data.concat(selected); // 深拷贝
                    data.push(dept);
                }
            } else {
                // 单选
                if (!this.contain(selected, dept)) {
                    data.push(dept);
                }
            }
            if (this.props.onSelected) this.props.onSelected(data);
        }

        renderCheckbox(): React.ReactNode {
            let { multiple, data, selected } = this.props;
            if (multiple !== undefined) {
                return (
                    <Checkbox checked={this.contain(selected, data)} onChange={() => this.click(data)}>
                        {data && data.title}
                    </Checkbox>
                );
            } else {
                return data && data.title;
            }
        }

        render(): React.ReactNode {
            let { data, index } = this.props;
            return data && (!data.children || data.children.length === 0) ? (
                <a className={"tree-node-title"} onClick={() => this.props.partSelect && this.props.partSelect(data)} key={index}>
                    <span> {this.renderCheckbox()}</span>
                </a>
            ) : (
                <div className="tree-box" key={index}>
                    <Grid columns={0}>
                        <div className="tree-node-title">
                            <Grid columns={0}>
                                <i className="iconoa icon-righta tree-node-arrow" onClick={() => this.props.onExpand!(data)} />

                                <span onClick={() => (data.ParentID !== -1 ? this.props.partSelect && this.props.partSelect(data) : this.props.onExpand!(data))}>
                                    {this.renderCheckbox()}
                                </span>
                            </Grid>
                        </div>
                        {data && data.Num && (
                            <div className="sum-box">
                                <div className="number">{data && data.Num}</div>
                            </div>
                        )}
                    </Grid>
                </div>
            );
        }
    }

    interface TreeNodeProps {
        datas: any | any[];
        selected?: any[];
        partSelect?: (item: any) => void;
        onSelected?: (selected: any[]) => void;
        index: number;
        multiple?: number;
    }

    class TreeNode extends React.Component<TreeNodeProps, any> {
        constructor(props) {
            super(props);
            this.state = {
                expanded: (this.props.datas && this.props.datas.expanded) || false,
            } as any;
        }

        onExpand(item: any) {
            produce(item, (draft: Draft<any>) => {
                draft.expanded = !this.state.expanded;

            })
            this.setState({
                expanded: !this.state.expanded,
            });
        }

        onSelected(selected: any) {
            this.props.onSelected!(selected);
        }

        render(): React.ReactNode {
            const { datas, index, multiple, onSelected, selected } = this.props;
            const { expanded } = this.state;
            return (
                <div className={`tree-node ${expanded ? "active" : ""}`} key={"a" + index}>
                    <CellRenderer
                        selected={selected || []}
                        onSelected={this.onSelected.bind(this)}
                        data={datas}
                        onExpand={this.onExpand.bind(this)}
                        multiple={multiple}
                        partSelect={(item) => this.props.partSelect!(item)}
                        index={index}
                    />
                    {datas &&
                        datas.children &&
                        datas.children.map((d, i) => (
                            <TreeNode onSelected={onSelected} selected={selected} datas={d} multiple={multiple} index={i} key={i} partSelect={(j) => this.props.partSelect!(j)} />
                        ))}
                </div>
            );
        }
    }
}
