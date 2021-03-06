import React, { Component } from 'react';
import LazyLoad from 'react-lazy-load';
import ScrollToTop from 'react-scroll-up';
import fetchJsonp from 'fetch-jsonp';

import './App.css';
import Spinner from './components/Spinner'
//import "bootstrap/dist/css/bootstrap.css";

import "bootswatch/journal/bootstrap.css";
import { Navbar, NavItem, Nav, Grid, Row, Col, Button } from "react-bootstrap";

let GROUPS = [
    { name: "WNM", domain: "weneedmusic", photo: "https://pp.userapi.com/c626417/v626417619/618f2/e82NltroBk0.jpg" },
    { name: "Deep House", domain: "deephouse", photo: "https://pp.userapi.com/c636119/v636119886/22dcc/P_BIJ2AFOG8.jpg" },
    { name: "ЁП", domain: "fuck_humor", photo: "https://pp.userapi.com/c837328/v837328577/3fe7e/dkQr0rjE50k.jpg" },
    { name: "Лепрозорий", domain: "leprazo", photo: "https://pp.userapi.com/c627723/v627723497/2126c/nTaHcFZL4Qk.jpg" },
    { name: "Правильные Мысли", domain: "world_thoughts", photo: "https://pp.userapi.com/c616329/v616329962/a288/Z_ytjAq-ZMI.jpg" }
];
GROUPS = localStorage.getItem('groups') && localStorage.getItem('groups').length ? JSON.parse(localStorage.getItem('groups')) : GROUPS;

class WeatherDisplay extends Component {
    constructor() {
        super();
        this.state = {
            weatherData: null,
            sortedData: null
        };
    }

    componentDidMount() {
        this.fetchData(this.props.domain);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.domain !== this.props.domain) {
            this.setState({ sortedData: null });
            this.fetchData(newProps.domain);
        }
    }

    fetchData(domain) {
        const URL = `https://api.vk.com/method/wall.get?domain=${domain}&v=5.64&count=100&access_token=f840ba08f840ba08f840ba0859f81c0d83ff840f840ba08a10260470c008425f33e5a07`;

        this.setState({ isLoading: true });
        fetchJsonp(URL)
            .then(res => res.json())
            .then(json => {
                this.setState({ weatherData: json.response.items, isLoading: false  });
                this.setState({
                    sortedData: this.state.weatherData.sort(this.sortByLikes)
                });                
            })
            .catch(error => {
                console.error(error);
                this.setState({ sortedData: 'empty' });
            });
    }

    sortByLikes = function(a,b) {
        let aLikes = a.likes.count;
        let bLikes = b.likes.count;
        return bLikes - aLikes;
    };
    render() {
        const weatherData = this.state.sortedData;

        if (!weatherData) return (
            <Spinner />
        );
        if (weatherData === 'empty' ) return (
            <div>Something went wrong. Try to turn on VPN and reload the page.</div>
        );
        return (
            <div>
                <div className="fade-in">
                    {weatherData.map((post, index) => (
                        <div key={index} className="post">
                            <div className="filler fade-in"></div>
                            <LazyLoad offsetVertical={500}>
                                <div>
                                    <img src={post.attachments && post.attachments[0].photo ? post.attachments[0].photo.photo_604 : ''}
                                         alt=""
                                         className="fade-in border-radius"/>
                                    <img src={post.attachments && post.attachments[0].album ? post.attachments[0].album.thumb.photo_604 : ''}
                                         alt=""
                                         className="fade-in border-radius"/>
                                </div>
                            </LazyLoad>
                            <p className="post-description">{post.text}</p>
                            {post.attachments ? post.attachments.map((item, index) => {
                                if (item.type === 'audio') {
                                    return <p key={index}>{item.audio.artist} - {item.audio.title}</p>
                                } else if (item.type === 'video') {
                                    return <div key={index}>
                                        <img src={item.video.photo_320} alt=""/>
                                        <p className="mt10">{item.video.title}</p>
                                    </div>
                                }
                                else return <div key={index}></div>
                            }) : ''}
                            <p className="likes">{post.likes.count} <span className="glyphicon glyphicon-heart"></span></p>
                            <a href={`https://vk.com/${this.props.domain}?w=wall${post.from_id}_${post.id}`} target="_blank">More</a>
                        </div>
                    ))}
                </div>
                <ScrollToTop showUnder={160}>
                    <span><i className="glyphicon glyphicon-arrow-up to-top"></i></span>
                </ScrollToTop>
            </div>
        );
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            activeGroup: 0,
            activeDomain: GROUPS[0].domain,
            newGroup: null,
            isLoading: false,
            alreadyInListError: false,
            fetchError: false,
            test: false,
            newGroupError: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        this.setState({
            isLoading: true,
            newGroup: null
        });
        const groupId = this.refs.groupId.value;
        const URL = "https://api.vk.com/method/groups.getById?group_id=" +
            groupId +
            "&v=5.64&fields=description,members_count";
        fetchJsonp(URL)
            .then(res => {
                return res.json();
            })
            .then(json => {                
                if (json && json.error) {
                    this.setState({
                        newGroupError: true,
                        isLoading: false
                    })
                }
                else this.setState({
                    newGroup: json.response ? json.response[0] : null,
                    isLoading: false,
                    newGroupError: false
                });
            })
            .catch(error => {
                //console.error(error);
                this.setState({
                    isLoading: false,
                    fetchError: true
                });
            });
    }

    handleAdd() {
        if (!GROUPS.some(item => item.domain === this.state.newGroup.screen_name)) {
            GROUPS.push({
                name: this.state.newGroup.name,
                domain: this.refs.groupId.value,
                photo: this.state.newGroup['photo_200']
            });
            localStorage.setItem('groups', JSON.stringify(GROUPS));
            this.setState({ newGroup: null });
            this.refs.groupId.focus();
        } else {
            this.setState({ alreadyInListError: true });
        }
        this.forceUpdate();
        this.refs.groupId.value = '';
    }

    handleGetPosts() {
        this.setState({activeDomain: this.state.newGroup.screen_name});
    }

    handleDelete(index, event) {
        event.stopPropagation();
        GROUPS = GROUPS.filter((item, i) => i !== index);
        localStorage.setItem('groups', JSON.stringify(GROUPS));

        index > this.state.activeGroup ? this.forceUpdate() : window.location.reload();
    }

    render() {
        const activeGroup = this.state.activeGroup;
        return (
            <div>
                <Navbar>
                    <Navbar.Header>
                        <Navbar.Brand>
                            Likes App
                        </Navbar.Brand>
                    </Navbar.Header>
                </Navbar>
                <Grid>
                    <Row>
                        <Col md={4} sm={4}>
                            <h3>Select a VK group</h3>
                            <Nav
                                bsStyle="pills"
                                stacked
                                className="nav-button"
                                activeKey={activeGroup}
                                onSelect={index => {
                                    this.setState({
                                        activeGroup: index,
                                        activeDomain: GROUPS[index].domain
                                     });
                                }}
                            >
                                {GROUPS.map((place, index) => (
                                    <NavItem key={index} eventKey={index}>
                                        <img key={index} src={place.photo} className="nav-item-img" alt=""/>
                                        {place.name}
                                        <span
                                            className={GROUPS.length === 1 ? 'none' : 'glyphicon glyphicon-trash nav-delete-btn'}
                                            data-toggle="tooltip" data-placement="top" title="Delete group"
                                            onClick={(event) => this.handleDelete(index, event)}>
                                        </span>
                                    </NavItem>
                                ))}
                            </Nav>
                            <h3>Or find it by name...</h3>
                            <form className="form-inline" onSubmit={this.handleSubmit}>
                                <input
                                    type="text"
                                    ref="groupId"
                                    className="form-control find-input"
                                    placeholder="Enter name of the group or id"
                                    onSubmit={this.handleChange} />
                                <button type="submit" className="btn btn-primary find-btn">Find</button>
                                {this.state.newGroup ?
                                    <div className="fade-in find-results-block">
                                        <img src={this.state.newGroup.photo_200} alt=""/>
                                        <p>{this.state.newGroup.description}</p>
                                        <div className="find-btn-wrapper">
                                            <Button bsStyle="primary"
                                                    className="find-results-btn"
                                                    onClick={this.handleGetPosts.bind(this)}>
                                                Get posts
                                            </Button>
                                            <Button bsStyle="info"
                                                    onClick={this.handleAdd.bind(this)}
                                                    className="find-results-btn"
                                                    onBlur={() => this.setState({alreadyInListError : false})}>
                                                Add to list
                                            </Button>
                                        </div>
                                        {this.state.alreadyInListError ? <div>Already in list</div> : ''}
                                    </div>
                                    :
                                    <div>
                                        {this.state.isLoading ? <Spinner /> : ''}
                                        {this.state.fetchError ? <div>Something went wrong. Try to turn on VPN and reload the page.</div> : ''}
                                        {this.state.newGroupError ? <div>Can't find information about group. Try to enter correct name.</div> : ''}
                                    </div>
                                }
                            </form>
                        </Col>
                        <Col md={8} sm={8}>
                            <WeatherDisplay key={activeGroup} domain={this.state.activeDomain} />
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

export default App;
