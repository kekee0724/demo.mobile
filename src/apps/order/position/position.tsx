import React from "react";

import {
  WhiteSpace,
  List,
  DatePicker,
  Flex,
  Badge,
  Button,
  Drawer,
  NavBar,
  SearchBar,
  Accordion,
  Radio,
  Icon
} from "antd-mobile-v2";

import Skeleton, {SkeletonTheme} from "react-loading-skeleton";

import {template, formatDateTime, formatNow, getDate, getLocalStorage, setLocalStorage} from "@reco-m/core";

import {ListComponent, ImageAuto, setEventWithLabel, setNavTitle} from "@reco-m/core-ui";

import {statisticsEvent} from "@reco-m/ipark-statistics";

import {
  Namespaces,
  DAY_START_TIME,
  getResourceTitle,
  DAY_END_TIME,
  PriceUnitEnum,
  positionModel,
  RoomTypeEnum
} from "@reco-m/order-models";
import {ResourceTypeEnum} from "@reco-m/ipark-common";

export namespace Position {
  export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {
  }

  export interface IState extends ListComponent.IState, positionModel.StateType {
    open?: boolean;
    dataSource?: any;
  }

  export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
    key: any;
    showheader = false;
    namespace = Namespaces.position;
    data1: any = [];
    data2: any = [];
    now = new Date();
    showloading = false;
    scrollable = false;

    componentReceiveProps(nextProps: Readonly<IProps>): void {
      setNavTitle.call(this, getResourceTitle(this.props.match!.params.resourceType), nextProps);
      this.shouldUpdateData(nextProps.state);

      let locationChanged = nextProps.location !== this.props.location;
      if (locationChanged) {
        this.pullToRefresh();
      }
    }

    componentWillUnmount() {
      this.dispatch({
        type: "init",
      });
    }

    componentDidMount() {
      setNavTitle.call(this, getResourceTitle(this.props.match!.params.resourceType));
      this.key = this.getSearchParam("key");
      this.getDataList = this.getDataList.bind(this);

      let startDate = formatNow("yyyy/MM/dd") + DAY_START_TIME;
      let endDate = formatNow("yyyy/MM/dd") + DAY_END_TIME;
      const resourceType = this.props.match!.params.resourceType;

      this.dispatch({type: `initPage`, data: {startDate: startDate, endDate: endDate, resourceType, key: this.key}});
    }

    getDataList(pageIndex: number, startDate: any, endDate: any) {
      const resourceType = this.props.match!.params.resourceType;
      this.dispatch({type: "getResourceAction", pageIndex, startDate, endDate, resourceType, searchParam: this.key});
    }

    /**
     * 刷新列表
     */
    pullToRefresh() {
      const {state} = this.props;
      this.getDataList(1, state!.startDate, state!.endDate);
    }

    /**
     * 上拉刷新
     */
    onEndReached() {
      const {state} = this.props;
      this.getDataList((state!.currentPage || 0) + 1, state!.startDate, state!.endDate);
    }

    renderItemButton(item: any): React.ReactNode {
      if (item.status && item.status.freeItems > 0) {
        return (
          <div className="my-apply-btn">
            <Button
              type="primary"
              size="small"
              inline
              onClick={(e) => {
                e.stopPropagation();
                this.goTo(`order/${item.resource.id}/${item.resource.roomId}/${item.resource.priceUnit}`);
              }}
            >
              我要预订
            </Button>
          </div>
        );
      } else {
        return (
          <div className="my-apply">
            <Button size="small" inline disabled className="button-round">
              已占用
            </Button>
          </div>
        );
      }
    }

    renderItemsContentFlex(item: any): React.ReactNode {
      return (
        <Flex>
          <Flex.Item>
            <div className="size-12 color-minor omit omit-1 ">
              <i className="icon icon-newadds size-12 "/> {item.resource && item.resource.address}
            </div>
            {item.resource.resourceType === ResourceTypeEnum.working ? (
              <div className="size-12 color-minor omit omit-1">
                                <span>
                                    <i className="icon icon-yonghu size-12"/> {item.status && item.status.freeItems}个可被预订
                                </span>
              </div>
            ) : (
              ""
            )}
          </Flex.Item>
          {this.renderItemButton(item)}
        </Flex>
      );
    }

    /**
     * 渲染Items的内容
     */
    renderItemsContent(item?: any, _?: any, i?: number): React.ReactNode {
      const {resourceType} = this.props.match!.params.resourceType;
      return (
        <div
          onClick={() => {
            Number(resourceType) === RoomTypeEnum.workingType
              ? setEventWithLabel(statisticsEvent.serviceStationDetailView)
              : setEventWithLabel(statisticsEvent.serviceAdvertisingDetailView);
            this.goTo({
              pathname: `detail/${item.resource.id}`,
              state: {
                freeItems: item.status.freeItems,
              },
            });
          }}
        >
          <List key={i} className="line-border-no">
            <List.Item wrap>
              <WhiteSpace/>
              <ImageAuto.Component cutWidth="384" cutHeight="233" src={item && item.coverUrl}>
                <Badge
                  className="badge-parkRight"
                  text={item.resource.price ? item.resource.price + (item.resource.priceUnit === PriceUnitEnum.perDay ? "元/个/天" : "元/个/月") : "免费"}
                />
              </ImageAuto.Component>
              <div className="park-title">{item.resource.resourceName}</div>
              {this.renderItemsContentFlex(item)}
            </List.Item>
          </List>
          <WhiteSpace className="back"/>
        </div>
      );
    }

    renderNavBar(): React.ReactNode {
      let {state} = this.props;
      const isOpen = state!.isOpen;
      return (
        <NavBar
          className="park-nav"
          icon={<Icon type="left"/>}
          onLeftClick={() => {
            this.goBack();
          }}
          rightContent={<Icon type="search" onClick={() => this.dispatch({type: "input", data: {isOpen: !isOpen}})}/>}
        >
          {getResourceTitle(this.props.match!.params.resourceType)}
        </NavBar>
      );
    }

    renderBuildings(buildingsData: any, checkedTag: any, index: number): React.ReactNode {
      return (
        <Accordion.Panel
          key={index}
          header={
            <Flex>
              <Flex.Item>所属楼宇</Flex.Item>
              <span className="slide-sub-title">{checkedTag && checkedTag.spaceName}</span>
            </Flex>
          }
        >
          <List>
            <Radio.RadioItem
              checked={!checkedTag}
              onClick={() => {
                this.dispatch({type: "input", data: {buildingItem: null}});
              }}
            >
              不限
            </Radio.RadioItem>
          </List>
          <List>
            {buildingsData.map((tag, i) => (
              <Radio.RadioItem
                key={index + "" + i}
                checked={checkedTag && checkedTag.spaceId === tag.spaceId}
                onClick={() => {
                  this.dispatch({type: "input", data: {buildingItem: tag}});
                }}
              >
                {tag.spaceName}
              </Radio.RadioItem>
            ))}
          </List>
        </Accordion.Panel>
      );
    }

    renderProjectsMao(projectsData: any, checkedTag: any): React.ReactNode {
      return (
        projectsData &&
        projectsData.map((tag, i) => (
          <Radio.RadioItem
            key={i}
            checked={checkedTag && checkedTag.spaceId === tag.spaceId}
            onClick={() => {
              this.dispatch({
                type: "getBuildsAction",
                parmas: {parkId: getLocalStorage("parkId"), spaceTypeList: 4, spaceIdList: tag.spaceId},
              });
              this.dispatch({type: "input", data: {buildingItem: null, projectsItem: tag}});
            }}
          >
            {tag.spaceName}
          </Radio.RadioItem>
        ))
      );
    }

    renderAccordionPanelContent(projectsData: any, checkedTag: any): React.ReactNode {
      return (
        <>
          <List>
            <Radio.RadioItem
              checked={!checkedTag}
              onClick={() => {
                this.dispatch({type: "input", data: {projectsItem: null, buildingItem: null, buildingsData: []}});
              }}
            >
              不限
            </Radio.RadioItem>
          </List>
          <List>{this.renderProjectsMao(projectsData, checkedTag)!}</List>
        </>
      );
    }

    renderProjects(projectsData: any, checkedTag: any, index: number): React.ReactNode {
      return (
        <Accordion defaultActiveKey="0" key={index}>
          <Accordion.Panel
            header={
              <Flex>
                <Flex.Item>项目物业</Flex.Item>
                <span className="slide-sub-title">{checkedTag && checkedTag.ProjectName}</span>
              </Flex>
            }
          >
            {this.renderAccordionPanelContent(projectsData, checkedTag)}
          </Accordion.Panel>
        </Accordion>
      );
    }

    renderSiderBarResetDetermine(): React.ReactNode {
      const {state} = this.props,
        StartDate = state!.startDate,
        EndDate = state!.endDate;

      return (
        <Flex className="flex-collapse row-collapse">
          <Flex.Item>
            <Button
              onClick={() => {
                this.dispatch({
                  type: "input",
                  data: {
                    key: "",
                    buildingItem: null,
                    projectsItem: null,
                    buildingsData: null,
                  },
                });
                this.key = "";
              }}
            >
              重置
            </Button>
          </Flex.Item>
          <Flex.Item>
            <Button
              type={"primary"}
              onClick={() => {
                $(".am-list-view-scrollview").animate({scrollTop: 0});
                this.dispatch({type: "input", data: {isOpen: false}});
                this.getDataList(1, StartDate, EndDate);
              }}
            >
              确定
            </Button>
          </Flex.Item>
        </Flex>
      );
    }

    renderSideBar(): React.ReactNode {
      const {state} = this.props,
        projectsData = state!.projectsData,
        projectsItem = state!.projectsItem,
        buildingsData = state!.buildingsData,
        buildingItem = state!.buildingItem,
        key = state!.key;

      return (
        <div className="drawer-detail">
          <div className="container-column container-fill">
            {client.showheader && <NavBar className="park-nav">筛选</NavBar>}
            <SearchBar
              placeholder="搜索"
              value={key || this.key !== null ? key || this.key : ""}
              onChange={(value) => {
                this.dispatch({type: "input", data: {key: value}});
                this.key = value;
              }}
            />
            <WhiteSpace/>
            <div className="container-fill container-scrollable">
              <Accordion accordion defaultActiveKey="0" className="my-accordion">
                {projectsData && this.renderProjects(projectsData, projectsItem && projectsItem, 3)}
                {buildingsData && this.renderBuildings(buildingsData, buildingItem && buildingItem, 4)}
              </Accordion>
            </div>
            {this.renderSiderBarResetDetermine()}
          </div>
        </div>
      );
    }

    renderHeaderStartDate(): React.ReactNode {
      const {state} = this.props,
        startDate = state!.startDate,
        endDate = state!.endDate;

      return (
        <DatePicker
          mode="date"
          minDate={new Date()}
          value={getDate(startDate)!}
          onOk={(v) => {
            this.scrollTo();
            let start = formatDateTime(v, "yyyy/MM/dd 00:00:00"),
              end = endDate;
            if (start >= startDate) {
              end = formatDateTime(v, "yyyy/MM/dd 23:59:00");
            }
            this.dispatch({type: "input", data: {startDate: start, endDate: end}});
            this.getDataList(1, start, end);
            let startd = start.replace(/-/g, "/");
            const newstart = new Date(startd);
            setLocalStorage("ResourceStartDate", formatDateTime(newstart, "yyyy-MM-dd hh:mm:ss"));
            setLocalStorage("ResourceendDate", end);
          }}
        >
          <div>
            <div style={{fontSize: "15px"}}>{formatDateTime(startDate, "MM-dd")}</div>
          </div>
        </DatePicker>
      );
    }

    renderHeaderEndDate(): React.ReactNode {
      const {state} = this.props,
        startDate = state!.startDate,
        endDate = state!.endDate;

      return (
        <DatePicker
          mode="date"
          minDate={new Date(startDate)}
          value={getDate(endDate)!}
          onOk={(v) => {
            this.scrollTo();
            let end = formatDateTime(v, "yyyy/MM/dd 23:59:00");
            this.dispatch({type: "input", data: {endDate: end}});
            this.getDataList(1, startDate, end);
          }}
        >
          <div>
            <div style={{fontSize: "15px"}}>{formatDateTime(endDate, "MM-dd")}</div>
          </div>
        </DatePicker>
      );
    }

    renderHeaderView(): React.ReactNode {
      const {state} = this.props,
        startDate = state!.startDate;

      return (
        startDate && (
          <div>
            {this.renderNavBar()}
            <List>
              <List.Item>
                <Flex className="text-center">
                  <Flex.Item>{this.renderHeaderStartDate()}</Flex.Item>
                  <Flex.Item>
                    <div className="cday">预订时间</div>
                  </Flex.Item>
                  <Flex.Item>{this.renderHeaderEndDate()}</Flex.Item>
                </Flex>
              </List.Item>
            </List>
          </div>
        )
      );
    }

    getCountArr(count) {
      let items: any = [];
      for (let i = 0; i < count; i++) {
        items.push(1);
      }
      return items;
    }

    /**
     * 骨架屏
     */
    renderSkeletons(count): React.ReactNode {
      let items = this.getCountArr(count);
      return items.map((_, i) => (
        <List.Item key={i} wrap>
          <SkeletonTheme color={"#F0F0F0"} highlightColor={"f5f5f5"}>
            <Skeleton height={180}/>
            <div className="mt14">
              <Skeleton count={1} height={20}/>
            </div>
            <Flex className="mt5" align="center">
              <Flex.Item>
                <Skeleton count={1} height={20} width={200}/>
              </Flex.Item>
              <Skeleton count={1} height={20} width={50}/>
            </Flex>
          </SkeletonTheme>
        </List.Item>
      ));
    }

    render(): React.ReactNode {
      const isOpen = this.props.state!.isOpen,
        sidebar = this.renderSideBar();
      const {state} = this.props;
      return (
        <Drawer sidebar={sidebar} docked={false} open={isOpen}
                onOpenChange={() => this.dispatch({type: "input", data: {isOpen: !isOpen}})} position="right">
          <div className="container container-fill container-column">
            {this.renderHeaderView()}
            <div className="container-scrollable container-fill body">
              {state!.refreshing !== false ? this.renderSkeletons(3) : this.getListView()}
            </div>
          </div>
        </Drawer>
      );
    }
  }

  export const Page = template(Component, (state) => state[Namespaces.position]);
}
