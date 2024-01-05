import { useState,useEffect,useRef } from 'react';
import Axios from 'axios';
import { configuration } from './Configs';
import { useSearchParams } from 'react-router-dom';
import CustomHeader from "../components/Header";
import AppLayout from "@cloudscape-design/components/app-layout";
import Box from "@cloudscape-design/components/box";
import Tabs from "@cloudscape-design/components/tabs";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import { SplitPanel } from '@cloudscape-design/components';

import Flashbar from "@cloudscape-design/components/flashbar";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Spinner from "@cloudscape-design/components/spinner";

import FormField from "@cloudscape-design/components/form-field";
import Select from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Container from "@cloudscape-design/components/container";
import CompMetric01  from '../components/Metric01';
import ChartLine04  from '../components/ChartLine04';
import ChartLine05  from '../components/ChartLine05';
import ChartRadialBar01 from '../components/ChartRadialBar01';
import ChartProgressBar01 from '../components/ChartProgressBar-01';
import ChartBar01 from '../components/ChartBar01';
import ChartBar02 from '../components/ChartBar02';
import Animation01 from '../components/Animation01';
import ChartPolar01 from '../components/ChartPolar-01';

export const splitPanelI18nStrings: SplitPanelProps.I18nStrings = {
  preferencesTitle: 'Split panel preferences',
  preferencesPositionLabel: 'Split panel position',
  preferencesPositionDescription: 'Choose the default split panel position for the service.',
  preferencesPositionSide: 'Side',
  preferencesPositionBottom: 'Bottom',
  preferencesConfirm: 'Confirm',
  preferencesCancel: 'Cancel',
  closeButtonAriaLabel: 'Close panel',
  openButtonAriaLabel: 'Open panel',
  resizeHandleAriaLabel: 'Resize split panel',
};



var CryptoJS = require("crypto-js");
const percentile = require("percentile");

function App() {
    
    //-- Connection Usage
    const [connectionMessage, setConnectionMessage] = useState([]);
    
    
    //-- Gather Parameters
    const [params]=useSearchParams();
    
    //--######## Global Settings
    
    //-- Variable for Active Tabs
    const [activeTabId, setActiveTabId] = useState("tab01");
    const currentTabId = useRef("tab01");
    
    
    const parameter_code_id=params.get("code_id");  
    const parameter_id=params.get("session_id");  
    var parameter_object_bytes = CryptoJS.AES.decrypt(parameter_id, parameter_code_id);
    var parameter_object_values = JSON.parse(parameter_object_bytes.toString(CryptoJS.enc.Utf8));
    
    //-- Configuration variables
    const cnf_connection_id=parameter_object_values["session_id"];  
    const cnf_identifier=parameter_object_values["rds_id"];  
    const cnf_username=parameter_object_values["rds_user"];
    const cnf_password=parameter_object_values["rds_password"];
    const cnf_auth=parameter_object_values["rds_auth"];
    const cnf_ssl=parameter_object_values["rds_ssl"];
    
    //-- Add token header
    Axios.defaults.headers.common['x-token'] = sessionStorage.getItem(cnf_connection_id);
    Axios.defaults.headers.common['x-token-cognito'] = sessionStorage.getItem("x-token-cognito");
    
    //-- Set Page Title
    document.title = configuration["apps-settings"]["application-title"] + ' - ' + cnf_identifier;
   

    //--######## RealTime Metric Features
    
    //-- Variable for Split Panels
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    const [metricDetailsIndex,setMetricDetailsIndex] = useState({index : 'cpu', title : 'CPU Usage(%)', timestamp : 0 });
    

    //-- Variable for Cluster Stats
    const [clusterStats,setClusterStats] = useState({ 
                                cluster : {
                                            status : "pending",
                                            ecpu : "0",
                                            storage : "-",
                                            AuthenticationFailures : 0,
                                            BytesUsedForCache : 0,
                                            CacheHitRate : 0,
                                            CacheHits : 0,
                                            CommandAuthorizationFailures : 0,
                                            CurrConnections : 0,
                                            CurrItems : 0,
                                            CurrVolatileItems : 0,
                                            ElastiCacheProcessingUnits : 0,
                                            Evictions : 0,
                                            IamAuthenticationExpirations : 0,
                                            IamAuthenticationThrottling : 0,
                                            KeyAuthorizationFailures : 0,
                                            NetworkBytesIn : 0,
                                            NetworkBytesOut : 0,
                                            NewConnections : 0,
                                            SuccessfulReadRequestLatency : 0,
                                            SuccessfulWriteRequestLatency : 0,
                                            ThrottledCmds : 0,
                                            TotalCmdsCount : 0,
                                            //--Commands
                                            EvalBasedCmds : 0,
                                            EvalBasedCmdsECPUs : 0,
                                            GeoSpatialBasedCmds : 0,
                                            GeoSpatialBasedCmdsECPUs : 0,
                                            GetTypeCmds : 0,
                                            GetTypeCmdsECPUs : 0,
                                            HashBasedCmds : 0,
                                            HashBasedCmdsECPUs : 0,
                                            HyperLogLogBasedCmds : 0,
                                            HyperLogLogBasedCmdsECPUs : 0,
                                            JsonBasedCmds : 0,
                                            JsonBasedCmdsECPUs : 0,
                                            JsonBasedGetCmds : 0,
                                            JsonBasedGetCmdsECPUs : 0,
                                            JsonBasedSetCmds : 0,
                                            JsonBasedSetCmdsECPUs : 0,
                                            KeyBasedCmds : 0,
                                            KeyBasedCmdsECPUs : 0,
                                            ListBasedCmds : 0,
                                            ListBasedCmdsECPUs : 0,
                                            NonKeyTypeCmds : 0,
                                            NonKeyTypeCmdsECPUs : 0,
                                            PubSubBasedCmds : 0,
                                            PubSubBasedCmdsECPUs : 0,
                                            SetBasedCmds : 0,
                                            SetBasedCmdsECPUs : 0,
                                            SetTypeCmds : 0,
                                            SetTypeCmdsECPUs : 0,
                                            SortedSetBasedCmds : 0,
                                            SortedSetBasedCmdsECPUs : 0,
                                            StreamBasedCmds : 0,
                                            StreamBasedCmdsECPUs : 0,
                                            StringBasedCmds : 0,
                                            StringBasedCmdsECPUs : 0,
                                            lastUpdate : "-",
                                            connectionId : "-",
                                            history : {
                                                    AuthenticationFailures : [],
                                                    BytesUsedForCache : [],
                                                    CacheHitRate : [],
                                                    CacheHits : [],
                                                    CommandAuthorizationFailures : [],
                                                    CurrConnections : [],
                                                    CurrItems : [],
                                                    CurrVolatileItems : [],
                                                    ElastiCacheProcessingUnits : [],
                                                    Evictions : [],
                                                    IamAuthenticationExpirations : [],
                                                    IamAuthenticationThrottling : [],
                                                    KeyAuthorizationFailures : [],
                                                    NetworkBytesIn : [],
                                                    NetworkBytesOut : [],
                                                    NewConnections : [],
                                                    SuccessfulReadRequestLatency : [],
                                                    SuccessfulWriteRequestLatency : [],
                                                    ThrottledCmds : [],
                                                    TotalCmdsCount : [],
                                                    //-- Commands
                                                    EvalBasedCmds : [],
                                                    EvalBasedCmdsECPUs : [],
                                                    GeoSpatialBasedCmds : [],
                                                    GeoSpatialBasedCmdsECPUs : [],
                                                    GetTypeCmds : [],
                                                    GetTypeCmdsECPUs : [],
                                                    HashBasedCmds : [],
                                                    HashBasedCmdsECPUs : [],
                                                    HyperLogLogBasedCmds : [],
                                                    HyperLogLogBasedCmdsECPUs : [],
                                                    JsonBasedCmds : [],
                                                    JsonBasedCmdsECPUs : [],
                                                    JsonBasedGetCmds : [],
                                                    JsonBasedGetCmdsECPUs : [],
                                                    JsonBasedSetCmds : [],
                                                    JsonBasedSetCmdsECPUs : [],
                                                    KeyBasedCmds : [],
                                                    KeyBasedCmdsECPUs : [],
                                                    ListBasedCmds : [],
                                                    ListBasedCmdsECPUs : [],
                                                    NonKeyTypeCmds : [],
                                                    NonKeyTypeCmdsECPUs : [],
                                                    PubSubBasedCmds : [],
                                                    PubSubBasedCmdsECPUs : [],
                                                    SetBasedCmds : [],
                                                    SetBasedCmdsECPUs : [],
                                                    SetTypeCmds : [],
                                                    SetTypeCmdsECPUs : [],
                                                    SortedSetBasedCmds : [],
                                                    SortedSetBasedCmdsECPUs : [],
                                                    StreamBasedCmds : [],
                                                    StreamBasedCmdsECPUs : [],
                                                    StringBasedCmds : [],
                                                    StringBasedCmdsECPUs : [],
                                            },
                                            analytics : {
                                                labels : [],
                                                series : [],
                                                data : []
                                            },
                                            commandTypesTotal : [],
                                            commandTypesECPU : [],
                                },
                });
    
    
    
    //-- Variables for Analytics
                                                
    const [selectedOptionInterval,setSelectedOptionInterval] = useState({label: "3 Hours",value: 3});
    const analyticsInterval = useRef(3);
        
    const [selectedMetricAnalytics,setSelectedMetricAnalytics] = useState({label: "ElastiCacheProcessingUnits",value: "ElastiCacheProcessingUnits"});
    const analyticsMetricName = useRef({ name : "ElastiCacheProcessingUnits", factor : 60, descriptions : "The total number of ElastiCacheProcessingUnits (ECPUs) consumed by the requests executed on your cache", unit : "Count/sec" });
    
    const [dataAnalytics,setDatadAnalytics] = useState({ name : "", dataset : [], datasetSorted : [],  max :  0, min : 0, avg : 0, count : 0, p50 : 0, p90 : 0, p95 : 0 });
    
    const analyticsMetrics = [
                                {
                                  label: "Server metrics",
                                  options: [
                                            { label : "AuthenticationFailures", value : "AuthenticationFailures", factor : 60, descriptions : "The total number of failed attempts to authenticate to Redis using the AUTH command. We suggest setting an alarm on this to detect unauthorized access attempts.", unit : "Count/sec" },
                                            { label : "BytesUsedForCache", value : "BytesUsedForCache", factor : 1, descriptions : "The total number of bytes used by the data stored in your cache.", unit : "Bytes" },
                                            { label : "CacheHitRate", value : "CacheHitRate", factor : ( 1 / 100 ), descriptions : "Indicates the hit rate of your cache. This is calculated using cache_hits and cache_misses statistics in the following way: cache_hits /(cache_hits + cache_misses).", unit : "Percent" },
                                            { label : "CacheHits", value : "CacheHits", factor : 60, descriptions : "The number of successful read-only key lookups in the cache.", unit : "Count/sec" },
                                            { label : "CommandAuthorizationFailures", value : "CommandAuthorizationFailures", factor : 60, descriptions : "The total number of failed attempts by users to run commands they don’t have permission to call. We suggest setting an alarm on this to detect unauthorized access attempts.", unit : "Count/sec" },
                                            { label : "CurrConnections", value : "CurrConnections", factor : 1, descriptions : "The number of client connections to your cache.", unit : "Count" },
                                            { label : "CurrItems", value : "CurrItems", factor : 1, descriptions : "The number of items in the cache.", unit : "Count" },
                                            { label : "CurrVolatileItems", value : "CurrVolatileItems", factor : 1, descriptions : "The number of items in the cache with TTL.", unit : "Count/sec" },
                                            { label : "ElastiCacheProcessingUnits", value : "ElastiCacheProcessingUnits", factor : 60, descriptions : "The total number of ElastiCacheProcessingUnits (ECPUs) consumed by the requests executed on your cache", unit : "Count/sec" },
                                            { label : "Evictions", value : "Evictions", factor : 60, descriptions : "The count of keys evicted by the cache", unit : "Count/sec" },
                                            { label : "IamAuthenticationExpirations", value : "IamAuthenticationExpirations", factor : 60, descriptions : "The total number of expired IAM-authenticated Redis connections. You can find more information about Authenticating with IAM in the user guide.", unit : "Count/sec" },
                                            { label : "IamAuthenticationThrottling", value : "IamAuthenticationThrottling", factor : 60, descriptions : "The total number of throttled IAM-authenticated Redis AUTH or HELLO requests. You can find more information about Authenticating with IAM in the user guide.", unit : "Count/sec" },
                                            { label : "KeyAuthorizationFailures", value : "KeyAuthorizationFailures", factor : 60, descriptions : "The total number of failed attempts by users to access keys they don’t have permission to access. We suggest setting an alarm on this to detect unauthorized access attempts.", unit : "Count/sec" },
                                            { label : "NetworkBytesIn", value : "NetworkBytesIn", factor : 60, descriptions : "Total bytes transferred in to cache", unit : "Bytes" },
                                            { label : "NetworkBytesOut", value : "NetworkBytesOut", factor : 60, descriptions : "Total bytes transferred out of cache", unit : "Bytes" },
                                            { label : "NewConnections", value : "NewConnections", factor : 60, descriptions : "The total number of connections that have been accepted by the server during this period.", unit : "Count/sec" },
                                            { label : "SuccessfulReadRequestLatency", value : "SuccessfulReadRequestLatency", factor : 0.000001, descriptions : "Latency of successful read requests.", unit : "Microseconds" },
                                            { label : "SuccessfulWriteRequestLatency", value : "SuccessfulWriteRequestLatency", factor : 0.000001, descriptions : "Latency of successful write requests", unit : "Microseconds" },
                                            { label : "ThrottledCmds", value : "ThrottledCmds", factor : 60, descriptions : "The number of requests that were throttled by ElastiCache because the workload was scaling faster than ElastiCache can scale.", unit : "Count/sec" },
                                            { label : "TotalCmdsCount", value : "TotalCmdsCount", factor : 60, descriptions : "Total count of all commands executed on your cache", unit : "Count/sec" },
                                  ]
                                },
                                {
                                  label: "Command metrics",
                                  options: [
                                            { label : "EvalBasedCmds", value : "EvalBasedCmds", factor : 60, descriptions : "The number of get commands the cache has received.", unit : "Count/sec" },
                                            { label : "EvalBasedCmdsECPUs", value : "EvalBasedCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by eval-based commands.", unit : "Count/sec" },
                                            { label : "GeoSpatialBasedCmds", value : "GeoSpatialBasedCmds", factor : 60, descriptions : "The total number of commands for geospatial-based commands. This is derived from the Redis commandstats statistic. It's derived by summing all of the geo type of commands: geoadd, geodist, geohash, geopos, georadius, and georadiusbymember.", unit : "Count/sec" },
                                            { label : "GeoSpatialBasedCmdsECPUs", value : "GeoSpatialBasedCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by geospatial-based commands.", unit : "Count/sec" },
                                            { label : "GetTypeCmds", value : "GetTypeCmds", factor : 60, descriptions : "The total number of read-only type commands. This is derived from the Redis commandstats statistic by summing all of the read-only type commands (get, hget, scard, lrange, and so on.)", unit : "Count/sec" },
                                            { label : "GetTypeCmdsECPUs", value : "GetTypeCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by read commands.", unit : "Count/sec" },
                                            { label : "HashBasedCmds", value : "HashBasedCmds", factor : 60, descriptions : "The total number of commands that are hash-based. This is derived from the Redis commandstats statistic by summing all of the commands that act upon one or more hashes (hget, hkeys, hvals, hdel, and so on).", unit : "Count/sec" },
                                            { label : "HashBasedCmdsECPUs", value : "HashBasedCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by hash-based commands.", unit : "Count/sec" },
                                            { label : "HyperLogLogBasedCmds", value : "HyperLogLogBasedCmds", factor : 60, descriptions : "The total number of HyperLogLog-based commands. This is derived from the Redis commandstats statistic by summing all of the pf type of commands (pfadd, pfcount, pfmerge, and so on.).", unit : "Count/sec" },
                                            { label : "HyperLogLogBasedCmdsECPUs", value : "HyperLogLogBasedCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by HyperLogLog-based commands.", unit : "Count/sec" },
                                            { label : "JsonBasedCmds", value : "JsonBasedCmds", factor : 60, descriptions : "The total number of JSON commands, including both read and write commands. This is derived from the Redis commandstats statistic by summing all JSON commands that act upon JSON keys.", unit : "Count/sec" },
                                            { label : "JsonBasedCmdsECPUs", value : "JsonBasedCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by all JSON commands, including both read and write commands.", unit : "Count/sec" },
                                            { label : "JsonBasedGetCmds", value : "JsonBasedGetCmds", factor : 60, descriptions : "The total number of JSON read-only commands. This is derived from the Redis commandstats statistic by summing all JSON read commands that act upon JSON keys.", unit : "Count/sec" },
                                            { label : "JsonBasedGetCmdsECPUs", value : "JsonBasedGetCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by JSON read-only commands.", unit : "Count/sec" },
                                            { label : "JsonBasedSetCmds", value : "JsonBasedSetCmds", factor : 60, descriptions : "The total number of JSON write commands. This is derived from the Redis commandstats statistic by summing all JSON write commands that act upon JSON keys.", unit : "Count/sec" },
                                            { label : "JsonBasedSetCmdsECPUs", value : "JsonBasedSetCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by JSON write commands.", unit : "Count/sec" },
                                            { label : "KeyBasedCmds", value : "KeyBasedCmds", factor : 60, descriptions : "The total number of commands that are key-based. This is derived from the Redis commandstats statistic by summing all of the commands that act upon one or more keys across multiple data structures (del, expire, rename, and so on.).", unit : "Count/sec" },
                                            { label : "KeyBasedCmdsECPUs", value : "KeyBasedCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by key-based commands.", unit : "Count/sec" },
                                            { label : "ListBasedCmds", value : "ListBasedCmds", factor : 60, descriptions : "The total number of commands that are list-based. This is derived from the Redis commandstats statistic by summing all of the commands that act upon one or more lists (lindex, lrange, lpush, ltrim, and so on).", unit : "Count/sec" },
                                            { label : "ListBasedCmdsECPUs", value : "ListBasedCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by list-based commands.", unit : "Count/sec" },
                                            { label : "NonKeyTypeCmds", value : "NonKeyTypeCmds", factor : 60, descriptions : "The total number of commands that are not key-based. This is derived from the Redis commandstats statistic by summing all of the commands that do not act upon a key, for example, acl, dbsize or info.", unit : "Count/sec" },
                                            { label : "NonKeyTypeCmdsECPUs", value : "NonKeyTypeCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by non-key-based commands.", unit : "Count/sec" },
                                            { label : "PubSubBasedCmds", value : "PubSubBasedCmds", factor : 60, descriptions : "The total number of commands for pub/sub functionality. This is derived from the Redis commandstatsstatistics by summing all of the commands used for pub/sub functionality: psubscribe, publish, pubsub, punsubscribe, ssubscribe, sunsubscribe, spublish, subscribe, and unsubscribe.", unit : "Count/sec" },
                                            { label : "PubSubBasedCmdsECPUs", value : "PubSubBasedCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by pub/sub-based commands.", unit : "Count/sec" },
                                            { label : "SetBasedCmds", value : "SetBasedCmds", factor : 60, descriptions : "The total number of commands that are set-based. This is derived from the Redis commandstats statistic by summing all of the commands that act upon one or more sets (scard, sdiff, sadd, sunion, and so on).", unit : "Count/sec" },
                                            { label : "SetBasedCmdsECPUs", value : "SetBasedCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by set-based commands.", unit : "Count/sec" },
                                            { label : "SetTypeCmds", value : "SetTypeCmds", factor : 60, descriptions : "The total number of write types of commands. This is derived from the Redis commandstats statistic by summing all of the mutative types of commands that operate on data (set, hset, sadd, lpop, and so on.)", unit : "Count/sec" },
                                            { label : "SetTypeCmdsECPUs", value : "SetTypeCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by write commands.", unit : "Count/sec" },
                                            { label : "SortedSetBasedCmds", value : "SortedSetBasedCmds", factor : 60, descriptions : "The total number of commands that are sorted set-based. This is derived from the Redis commandstats statistic by summing all of the commands that act upon one or more sorted sets (zcount, zrange, zrank, zadd, and so on).", unit : "Count/sec" },
                                            { label : "SortedSetBasedCmdsECPUs", value : "SortedSetBasedCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by sorted-based commands.", unit : "Count/sec" },
                                            { label : "StreamBasedCmds", value : "StreamBasedCmds", factor : 60, descriptions : "The total number of commands that are stream-based. This is derived from the Redis commandstats statistic by summing all of the commands that act upon one or more streams data types (xrange, xlen, xadd, xdel, and so on).", unit : "Count/sec" },
                                            { label : "StreamBasedCmdsECPUs", value : "StreamBasedCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by stream-based commands.", unit : "Count/sec" },
                                            { label : "StringBasedCmds", value : "StringBasedCmds", factor : 60, descriptions : "The total number of commands that are string-based. This is derived from the Redis commandstats statistic by summing all of the commands that act upon one or more strings (strlen, setex, setrange, and so on).", unit : "Count/sec" },
                                            { label : "StringBasedCmdsECPUs", value : "StringBasedCmdsECPUs", factor : 60, descriptions : "ECPUs consumed by string-based commands.", unit : "Count/sec" },
                                  ]
                                },
                            ];
                            
                            
    
    //-- Variable for Command Analytics
    
    const [selectedCommandAnalytics,setSelectedCommandAnalytics] = useState({
                                                                            label: "ECPUs used by commands per second",
                                                                            value: "CmdsECPUs"
    });
    const analyticsCommandName = useRef("CmdsECPUs");
    const analyticsCommands = [
                                { label : 'Total commands received per second', value : 'Cmds' },
                                { label : 'ECPUs used by commands per second', value : 'CmdsECPUs' },
                            ];
    
  
    
    //-- Function Gather Metrics
    async function openClusterConnection() {
        
        var api_url = configuration["apps-settings"]["api_url"];
        Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");
        await Axios.post(`${api_url}/api/elasticache/redis/serverless/cluster/open/connection/`,{
                      params: { 
                                connectionId : cnf_connection_id,
                                clusterId : cnf_identifier,
                                host : parameter_object_values['rds_host'],
                                username : cnf_username,
                                password : cnf_password,
                                auth : cnf_auth,
                                ssl : cnf_ssl,
                                engineType : "elasticache:serverless"
                             }
              }).then((data)=>{
                
                
                if (data.data.newObject==false) {
                    setConnectionMessage([
                                  {
                                    type: "info",
                                    content: "Cluster connection already created at [" + data.data.creationTime + "] with identifier [" +  data.data.connectionId  + "], this connection will be re-used to gather metrics.",
                                    dismissible: true,
                                    dismissLabel: "Dismiss message",
                                    onDismiss: () => setConnectionMessage([]),
                                    id: "message_1"
                                  }
                    ]);
                }
                  
              })
              .catch((err) => {
                  console.log('Timeout API Call : api/elasticache/redis/serverless/cluster/open/connection/' );
                  console.log(err);
                  
              });
              
    }
   

    //-- Function Cluster Gather Stats
    async function gatherClusterStats() {
        
        var api_url = configuration["apps-settings"]["api_url"];
        
        if ( currentTabId.current == "tab01" || currentTabId.current == "tab02" || currentTabId.current == "tab04") {
            
            Axios.get(`${api_url}/api/elasticache/redis/serverless/cluster/gather/stats/`,{
                          params: { 
                                    connectionId : cnf_connection_id, 
                                    clusterId : cnf_identifier, 
                                    engineType : "elasticache:serverless"
                              
                          }
                      }).then((data)=>{
                       
                        var commandTypesTotal = [];
                        var analytics = { labels : [], series : [], data : [] };
                       
                        if (currentTabId.current == "tab01"){
                            
                            var commandType = "Cmds";
                            for (let metric of Object.keys(data.data.cluster.history)) {
                                if (metric.substr(metric.length - commandType.length ) == commandType && metric != "ThrottledCmds"  /*"CmdsECPUs"*/ ) {
                                    var total = data.data.cluster.history[metric].reduce((a,b) => a + b[1], 0);
                                    if ( total > 0 ){
                                        commandTypesTotal.push({ name : metric, data : data.data.cluster.history[metric] });
                                    }
                                }
                           }
                        }
                        
                        
                        if (currentTabId.current == "tab04"){
                            
                            var commandType = analyticsCommandName.current;
                            var serieList = [];
                            var labelList = [];
                            var dataList = [];
                            
                            for (let metric of Object.keys(data.data.cluster.history)) {
                                if (metric.substr(metric.length - commandType.length ) == commandType && metric != "ThrottledCmds"  /*"CmdsECPUs"*/ ) {
                                    var dataset  = data.data.cluster.history[metric];
                                    var total = dataset.reduce((a,b) => a + b[1], 0);
                                    if( total > 0 ) {
                                        labelList.push(metric);
                                        serieList.push( (total / dataset.length) || 0 );
                                        dataList.push({ name : metric, data : dataset });
                                    }
                                }
                               
                           }
                            
                           analytics = { labels : labelList, series : serieList, data : dataList }; 
                           
                        }
                       
                       
                       setClusterStats({ cluster : {...data.data.cluster, analytics : analytics, commandTypesTotal : commandTypesTotal } });
                       
    
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/elasticache/redis/serverless/cluster/gather/stats/' );
                      console.log(err);
                      
                  });
        }
        
        
        if (currentTabId.current == "tab03") {
        
            var period = 1;
            switch(analyticsInterval.current) {
                case 1:
                case 3:
                    period = 1;
                    break;
                    
                case 6:
                    period = 3;
                    break;
                    
                case 12:
                    period = 5;
                    break;
                        
                case 24:
                    period = 10;
                    break;
                
                case 168:
                    period = 60;
                    break;
            }
        
            Axios.get(`${api_url}/api/elasticache/redis/serverless/cluster/gather/analytics/`,{
                          params: { 
                                    connectionId : cnf_connection_id, 
                                    clusterId : cnf_identifier, 
                                    metricName : analyticsMetricName.current.name,
                                    period : period,
                                    interval : analyticsInterval.current * 60,
                                    factor : analyticsMetricName.current.factor,
                                    engineType : "elasticache:serverless"
                              
                          }
                      }).then((data)=>{
                       
                            var dataset = data.data.metric.map((value, index) => {
                                    return data.data.metric[index][1];
                                });
                                
                            dataset = dataset.filter(elements => {
                                    return elements !== null;
                                })
                            
                            var max = Math.max(...dataset);
                            var min = Math.min(...dataset);
                            var avg = dataset.reduce((a,b) => a + b, 0) / dataset.length;
                            var stats = percentile([50,90,95], dataset);
                            
                            setDatadAnalytics({ name : analyticsMetricName.current.name , dataset : data.data.metric, datasetSorted : dataset.sort(function(a, b){return a - b}),  max : max, min : min, avg : avg, count : dataset.length, p50 : stats[0], p90 : stats[1], p95 : stats[2] });
    
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/elasticache/redis/serverless/cluster/gather/analytics/' );
                      console.log(err);
                      
                  });
            
        }

    }


    useEffect(() => {
        openClusterConnection();
    }, []);
    
    
    useEffect(() => {
        const id = setInterval(gatherClusterStats, configuration["apps-settings"]["refresh-interval-elastic"]);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    
    
    //-- Function Handle Logout
   const handleClickMenu = ({detail}) => {
          
            switch (detail.id) {
              case 'signout':
                  closeDatabaseConnection();
                break;
                
              case 'other':
                break;
              
            }
    };
    
    //-- Function Handle Logout
   const handleClickDisconnect = () => {
          closeDatabaseConnection();
    };
    
    
    //-- Close Database Connection
    
    const closeDatabaseConnection = () => {
        
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/elasticache/redis/serverless/cluster/close/connection/`,{
                      params: { connectionId : cnf_connection_id, clusterId : cnf_identifier,  engineType : "elasticache:serverless" }
                  }).then((data)=>{
                      closeTabWindow();
                      sessionStorage.removeItem(parameter_code_id);
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/elasticache/redis/serverless/cluster/close/connection/');
                      console.log(err)
                  });
                  
  
      
    }
       
    //-- Close TabWindow
    const closeTabWindow = () => {
              window.opener = null;
              window.open("", "_self");
              window.close();
      
    }

    function onClickMetric(metricId,metricTitle) {
        
        
        var dataset = clusterStats['cluster']['history'][metricId].map((value, index) => {
            return clusterStats['cluster']['history'][metricId][index][1];
        });
        
        dataset = dataset.filter(elements => {
            return elements !== null;
        })

        var max = Math.max(...dataset);
        var min = Math.min(...dataset);
        var avg = dataset.reduce((a,b) => a + b, 0) / dataset.length;
        var stats = percentile([50,90,95], dataset);
        
        setMetricDetailsIndex ({ index : metricId, title : metricTitle, p50 : stats[0], p90 : stats[1], p95 : stats[2], max : max, min : min, avg : avg });
        setsplitPanelShow(true);
                   
    }
    
    function onClickPolarChart(object) {}
 

  return (
    <div style={{"background-color": "#121b29"}}>
    
        <CustomHeader
            onClickMenu={handleClickMenu}
            onClickDisconnect={handleClickDisconnect}
            sessionInformation={parameter_object_values}
        />
        
        <AppLayout
        headerSelector="#h"
        contentType="table"
        disableContentPaddings={true}
        toolsHide={true}
        navigationHide={true}
        splitPanelOpen={splitPanelShow}
        onSplitPanelToggle={() => setsplitPanelShow(false)}
        splitPanelSize={350}
        splitPanel={
                  <SplitPanel  header={metricDetailsIndex.title} i18nStrings={splitPanelI18nStrings} closeBehavior="hide"
                    onSplitPanelToggle={({ detail }) => {
                                    
                                    }
                                  }
                  >
                     
                    { splitPanelShow === true &&
                    
                    <table style={{"width":"100%", "padding": "1em"}}>
                        <tr>
                            <td valign="top" style={{"width":"80%", "padding-left": "1em"}}>  
                                <ChartLine05 series={JSON.stringify([
                                                        { name : metricDetailsIndex.index, data : clusterStats['cluster']['history'][metricDetailsIndex.index] }
                                                    ])}
                                                    p50={metricDetailsIndex.p50}
                                                    p90={metricDetailsIndex.p90}
                                                    p95={metricDetailsIndex.p95}
                                                    avg={metricDetailsIndex.avg}
                                                    max={metricDetailsIndex.max}
                                                title={""} height="300px" 
                                />
                            </td>
                            <td valign="top" style={{"width":"10%", "padding-left": "1em"}}>  
                                <CompMetric01 
                                    value={metricDetailsIndex.p95 || 0}
                                    title={"p95"}
                                    precision={2}
                                    format={1}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />
                                <br/>
                                <CompMetric01 
                                    value={metricDetailsIndex.p90 || 0}
                                    title={"p90"}
                                    precision={2}
                                    format={1}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />
                                <br/>
                                <CompMetric01 
                                    value={metricDetailsIndex.p50 || 0}
                                    title={"p50"}
                                    precision={2}
                                    format={1}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />
                            </td>
                            <td valign="top" style={{"width":"10%", "padding-left": "1em"}}>  
                                <CompMetric01 
                                    value={metricDetailsIndex.max || 0}
                                    title={"Max"}
                                    precision={2}
                                    format={1}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />
                                <br/>
                                <CompMetric01 
                                    value={metricDetailsIndex.avg || 0}
                                    title={"Avg"}
                                    precision={2}
                                    format={1}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />
                                <br/>
                                <CompMetric01 
                                    value={metricDetailsIndex.min || 0}
                                    title={"Min"}
                                    precision={2}
                                    format={1}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />
                            </td>
                            
                        </tr>
                    </table>
                     
                    }
                        
                        
                  </SplitPanel>
        }
        content={
            <>              
                            <Flashbar items={connectionMessage} />
                            <table style={{"width":"100%"}}>
                                <tr>  
                                    <td style={{"width":"50%","padding-left": "1em", "border-left": "10px solid " + configuration.colors.lines.separator100,}}>  
                                        <SpaceBetween direction="horizontal" size="xs">
                                            { clusterStats['cluster']['status'] != 'available' &&
                                                <Spinner size="big" />
                                            }
                                            <Box variant="h3" color="text-status-inactive" >{parameter_object_values['rds_host']}</Box>
                                        </SpaceBetween>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <StatusIndicator type={clusterStats['cluster']['status'] === 'available' ? 'success' : 'pending'}> {clusterStats['cluster']['status']} </StatusIndicator>
                                        <Box variant="awsui-key-label">Status</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{ (parseFloat(clusterStats['cluster']['ecpu']).toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:0}) ) || 0 }</div>
                                        <Box variant="awsui-key-label">ECPU</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']['storage']} GB</div>
                                        <Box variant="awsui-key-label">Memory</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']['lastUpdate']}</div>
                                        <Box variant="awsui-key-label">LastUpdate</Box>
                                    </td>
                                </tr>
                            </table>
                            
                            
                            <Tabs
                                    disableContentPaddings
                                    onChange={({ detail }) => {
                                          setActiveTabId(detail.activeTabId);
                                          currentTabId.current=detail.activeTabId;
                                          setsplitPanelShow(false);
                                      }
                                    }
                                    activeTabId={activeTabId}
                                    tabs={[
                                      {
                                        label: "Performance Metrics",
                                        id: "tab01",
                                        content: 
                                          
                                          <>
                                            <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                <tr>  
                                                   <td> 
                                                        <Container>
                                                                <table style={{"width":"100%"}}>
                                                                    <tr>  
                                                                        <td valign="top" style={{"width":"10%", "padding-left": "1em", "text-align": "center"}}>  
                                                                                <ChartRadialBar01 
                                                                                    series={JSON.stringify([Math.round( ( (clusterStats['cluster']['ElastiCacheProcessingUnits'] / clusterStats['cluster']['ecpu']) * 100 ) ) || 0 ])} 
                                                                                    height="180px" 
                                                                                    title={"ECPU"}
                                                                                />
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ElastiCacheProcessingUnits','ElastiCacheProcessingUnits/sec')}>
                                                                                    <CompMetric01 
                                                                                        value={ clusterStats['cluster']['ElastiCacheProcessingUnits'] || 0}
                                                                                        title={"ECPU/sec"}
                                                                                        precision={0}
                                                                                        format={1}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                    />
                                                                                </a>
                                                                        </td>
                                                                        <td valign="top" style={{"width":"10%", "padding-left": "1em", "text-align": "center"}}>  
                                                                                <ChartRadialBar01 
                                                                                    series={JSON.stringify([ Math.round( ( (clusterStats['cluster']['BytesUsedForCache'] / ( clusterStats['cluster']['storage'] * 1024 * 1024 * 1024 )) * 100 )) || 0 ])} 
                                                                                    height="180px" 
                                                                                    title={"Memory"}
                                                                                />
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('BytesUsedForCache','BytesUsedForCache')}>
                                                                                    <CompMetric01 
                                                                                        value={clusterStats['cluster']['BytesUsedForCache'] || 0}
                                                                                        title={"Memory"}
                                                                                        precision={0}
                                                                                        format={2}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                    />
                                                                                </a>
                                                                                
                                                                        </td>
                                                                        <td valign="top" style={{"width":"3%", "padding-left": "1em", "text-align": "center"}}>  
                                                                                
                                                                        </td>
                                                                        <td valign="middle" style={{"width":"10%", "padding-left": "1em", "padding-right": "1em"}}>  
                                                                                <br/> 
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('TotalCmdsCount','TotalCmdsCount/sec')}>
                                                                                    <CompMetric01 
                                                                                        value={clusterStats['cluster']['TotalCmdsCount'] || 0}
                                                                                        title={"TotalCmds/sec"}
                                                                                        precision={0}
                                                                                        format={1}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                    />
                                                                                </a>
                                                                                <br />
                                                                                <br />
                                                                                <ChartProgressBar01 
                                                                                    value={ (clusterStats['cluster']['CacheHitRate']) || 0 }
                                                                                    valueSufix={"%"}
                                                                                    title={"CacheHitRate"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"24px"}
                                                                                />
                                                                        </td>
                                                                        
                                                                        <td valign="middle" style={{"width":"10%", "padding-left": "1em"}}> 
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('SuccessfulWriteRequestLatency','SuccessfulWriteRequestLatency(us)')}>
                                                                                    <CompMetric01 
                                                                                        value={clusterStats['cluster']['SuccessfulWriteRequestLatency'] || 0}
                                                                                        title={"WriteLatency(us)"}
                                                                                        precision={0}
                                                                                        format={1}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                    />
                                                                                </a>
                                                                                <br/> 
                                                                                <br/> 
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('SuccessfulReadRequestLatency','SuccessfulReadRequestLatency(us)')}>
                                                                                    <CompMetric01 
                                                                                        value={clusterStats['cluster']['SuccessfulReadRequestLatency'] || 0}
                                                                                        title={"ReadLatency(us)"}
                                                                                        precision={0}
                                                                                        format={1}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                        onClick={() => onClickMetric('ElastiCacheProcessingUnits','ECPU')}
                                                                                    />
                                                                                </a>
                                                                        </td>
                                                                        <td valign="middle" style={{"width":"10%", "padding-left": "1em"}}>  
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('NetworkBytesIn','NetworkBytesIn/sec')}>
                                                                                    <CompMetric01 
                                                                                        value={clusterStats['cluster']['NetworkBytesIn'] || 0}
                                                                                        title={"NetworkBytesIn/sec"}
                                                                                        precision={0}
                                                                                        format={2}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                    />
                                                                                </a>
                                                                                <br/> 
                                                                                <br/> 
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('NetworkBytesOut','NetworkBytesOut/sec')}>
                                                                                    <CompMetric01 
                                                                                        value={clusterStats['cluster']['NetworkBytesOut'] || 0}
                                                                                        title={"NetworkBytesOut/sec"}
                                                                                        precision={0}
                                                                                        format={2}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                    />
                                                                                </a>
                                                                        </td>
                                                                        
                                                                        <td valign="top"  style={{"width":"47%"}}>  
                                                                            <ChartBar01 series={JSON.stringify([
                                                                                                    { name : "TotalCmdsCount", data : clusterStats['cluster']['history']['TotalCmdsCount'] }
                                                                                                ])}
                                                                                            title={"TotalCmds/sec"} height="220px" 
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                    
                                                                </table>  
                                                                
                                                                <br />
                                                                <br />
                                                                <table style={{"width":"100%"}}>
                                                                    <tr> 
                                                                        <td style={{"width":"12.5%",  "padding-left": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('SetTypeCmds','SetTypeCmds/sec')}>
                                                                                <CompMetric01 
                                                                                    value={clusterStats['cluster']['SetTypeCmds'] || 0}
                                                                                    title={"SetTypeCmds/sec"}
                                                                                    precision={0}
                                                                                    format={3}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                            </a>
                                                                        </td>
                                                                        <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('SetTypeCmdsECPUs','SetTypeCmdsECPUs/sec')}>
                                                                                <CompMetric01 
                                                                                    value={clusterStats['cluster']['SetTypeCmdsECPUs'] || 0}
                                                                                    title={"SetTypeCmdsECPUs/sec"}
                                                                                    precision={0}
                                                                                    format={3}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                            </a>    
                                                                        </td>
                                                                        <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('GetTypeCmds','GetTypeCmds/sec')}>
                                                                                <CompMetric01 
                                                                                    value={clusterStats['cluster']['GetTypeCmds'] || 0}
                                                                                    title={"GetTypeCmds/sec"}
                                                                                    precision={0}
                                                                                    format={3}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                            </a>
                                                                        </td>
                                                                        <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('GetTypeCmdsECPUs','GetTypeCmdsECPUs/sec')}>
                                                                                <CompMetric01 
                                                                                    value={clusterStats['cluster']['GetTypeCmdsECPUs'] || 0}
                                                                                    title={"GetTypeCmdsECPUs/sec"}
                                                                                    precision={0}
                                                                                    format={3}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                            </a>
                                                                        </td>
                                                                        <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('CurrItems','CurrItems')}>
                                                                                <CompMetric01 
                                                                                    value={clusterStats['cluster']['CurrItems'] || 0}
                                                                                    title={"CurrItems"}
                                                                                    precision={0}
                                                                                    format={3}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                            </a>
                                                                        </td>
                                                                        <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('CurrVolatileItems','CurrVolatileItems')}>
                                                                                <CompMetric01 
                                                                                    value={clusterStats['cluster']['CurrVolatileItems'] || 0}
                                                                                    title={"CurrVolatileItems"}
                                                                                    precision={0}
                                                                                    format={3}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                                    
                                                            </table>  
                                                            <br />
                                                            <br />
                                                            <table style={{"width":"100%"}}>
                                                                <tr> 
                                                                    <td style={{"width":"12.5%",  "padding-left": "1em"}}>  
                                                                        <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('CacheHits','CacheHits/sec')}>
                                                                            <CompMetric01 
                                                                                value={clusterStats['cluster']['CacheHits'] || 0}
                                                                                title={"CacheHits/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </a>
                                                                    </td>
                                                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                        <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('AuthenticationFailures','AuthenticationFailures/sec')}>
                                                                            <CompMetric01 
                                                                                value={clusterStats['cluster']['AuthenticationFailures'] || 0}
                                                                                title={"AuthenticationFailures/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </a>
                                                                    </td>
                                                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                        <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('CurrConnections','CurrConnections')}>
                                                                            <CompMetric01 
                                                                                value={clusterStats['cluster']['CurrConnections'] || 0}
                                                                                title={"CurrConnections"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </a>
                                                                    </td>
                                                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                        <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('NewConnections','NewConnections/sec')}>
                                                                            <CompMetric01 
                                                                                value={clusterStats['cluster']['NewConnections'] || 0}
                                                                                title={"NewConnections/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </a>
                                                                    </td>
                                                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                        <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('Evictions','Evictions/sec')}>
                                                                            <CompMetric01 
                                                                                value={clusterStats['cluster']['Evictions'] || 0}
                                                                                title={"Evictions/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </a>
                                                                    </td>
                                                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                        <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ThrottledCmds','ThrottledCmds/sec')}>
                                                                            <CompMetric01 
                                                                                value={clusterStats['cluster']['ThrottledCmds'] || 0}
                                                                                title={"ThrottledCmds/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </a>    
                                                                    </td>
                                                                    
                                                                </tr>
                                                                    
                                                            </table>  
                                                                
                                                            <br />
                                                            <br />
                                                              
                                                            <table style={{"width":"100%"}}>
                                                              <tr>  
                                                                <td style={{"width":"100%","padding-left": "1em"}}> 
                                                                        <ChartLine04 series={JSON.stringify(clusterStats['cluster']['commandTypesTotal'])}
                                                                                        title={"CommandTypes/sec"} height="300px" 
                                                                        />
                                                                </td>
                                                              </tr>
                                                            </table>
                                                            <br/>
                                                            <br/>
                                                            <table style={{"width":"100%"}}>
                                                              <tr>  
                                                                <td style={{"width":"100%","padding-left": "1em"}}> 
                                                                        <ChartLine04 series={JSON.stringify([
                                                                                                { name : "ElastiCacheProcessingUnits", data : clusterStats['cluster']['history']['ElastiCacheProcessingUnits'] }
                                                                                            ])}
                                                                                        title={"ECPU/sec"} height="300px" 
                                                                        />
                                                                </td>
                                                              </tr>
                                                            </table>
                                                            <br/>
                                                            <br/>
                                                            <table style={{"width":"100%"}}>
                                                              <tr>  
                                                                <td style={{"width":"100%","padding-left": "1em"}}> 
                                                                        <ChartLine04 series={JSON.stringify([
                                                                                                { name : "SuccessfulWriteRequestLatency", data : clusterStats['cluster']['history']['SuccessfulWriteRequestLatency'] },
                                                                                                { name : "SuccessfulReadRequestLatency", data : clusterStats['cluster']['history']['SuccessfulReadRequestLatency'] }
                                                                                            ])}
                                                                                        title={"Latency (us)"} height="300px" 
                                                                        />
                                                                </td>
                                                              </tr>
                                                            </table>
                                                            <br/>
                                                            <br/>
                                                            <table style={{"width":"100%"}}>
                                                              <tr>  
                                                                <td style={{"width":"100%","padding-left": "1em"}}> 
                                                                        <ChartLine04 series={JSON.stringify([
                                                                                                { name : "NetworkBytesOut", data : clusterStats['cluster']['history']['NetworkBytesOut'] },
                                                                                                { name : "NetworkBytesIn", data : clusterStats['cluster']['history']['NetworkBytesIn'] }
                                                                                            ])}
                                                                                        title={"Network (Bytes)"} height="300px" 
                                                                        />
                                                                </td>
                                                              </tr>
                                                            </table>
                                                              
                                                        </Container>
                                                        <br/>
                                                        
                                                    </td>
                                                </tr>
                                            </table>  
                                                
                                                
                                          </>
                                          
                                      },
                                      {
                                        label: "Performance Visualization",
                                        id: "tab02",
                                        content: 
                                         
                                          <>
                                                 
                                              <table style={{"width":"100%", "padding": "1em"}}>
                                                    <tr>  
                                                        <td>
                                                            <Container>
                                                                    
                                                                    
                                                                    
                                                                    <table style={{"width": "100%"}}>
                                                                        <tr>  
                                                                            <td style={{"width": "40%", "padding-left": "1em", "padding-right": "1em",}}>
                                                                            </td>
                                                                            <td style={{"width": "20%", "padding-left": "1em", "padding-right": "1em", "border-radius": "10px", "border":  "3px solid" + configuration.colors.lines.separator101, "text-align": "center" }}>
                                                                                Request Routing Layer
                                                                            </td>
                                                                            <td style={{"width": "40%", "padding-left": "1em", "padding-right": "1em",}}>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table style={{"width": "100%", "padding" : "0em" }}>
                                                                        <tr>  
                                                                            <td style={{"width": "45%", "padding-left": "1em", "padding-right": "1em", "text-align": "right"}}>
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('NetworkBytesIn','NetworkBytesIn/sec')}>
                                                                                    <CompMetric01 
                                                                                        value={clusterStats['cluster']['NetworkBytesIn'] || 0}
                                                                                        title={"NetworkBytesIn/sec"}
                                                                                        precision={0}
                                                                                        format={2}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"20px"}
                                                                                    />
                                                                                </a>
                                                                            </td>
                                                                            <td style={{"width": "5%", "padding-left": "2px", "padding-right": "0em", "text-align": "left", }} >
                                                                                    <Animation01 />
                                                                            </td>
                                                                            <td style={{"width": "5%", "padding-left": "0em", "padding-right": "2px", "text-align": "right",  }}>
                                                                                    <Animation01 rotate="180deg" />
                                                                            </td>
                                                                            <td style={{"width": "45%", "padding-left": "1em", "padding-right": "1em", "text-align": "left"}}>
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('NetworkBytesOut','NetworkBytesOut/sec')}>
                                                                                    <CompMetric01 
                                                                                        value={clusterStats['cluster']['NetworkBytesOut'] || 0}
                                                                                        title={"NetworkBytesOut/sec"}
                                                                                        precision={0}
                                                                                        format={2}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"20px"}
                                                                                    />
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    
                                                                    <table style={{"width": "100%"}}>
                                                                        <tr>
                                                                            <td style={{"width": "100%", "padding-left": "1em", "padding-right": "1em", "border-radius": "10px", "border":  "5px solid" + configuration.colors.lines.separator101 }}>
                                                                                    
                                                                                    <table style={{"width": "100%"}}>
                                                                                        <tr>
                                                                                            <td style={{"width": "50%", }}>
                                                                                                <Box variant="h2" color="text-status-inactive" >Compute Layer</Box>
                                                                                            </td>
                                                                                            <td style={{"width": "50%", }}>
                                                                                            </td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td colspan="2" style={{"width": "100%", "text-align": "center" }}>
                                                                                            </td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td valign="top" style={{"width": "50%",  }}>
                                                                                            
                                                                                                <table style={{"width": "100%"}}>
                                                                                                    <tr>
                                                                                                        <td style={{"width": "70%", }}>
                                                                                                            <ChartProgressBar01 
                                                                                                                    value={ Math.round( ( (clusterStats['cluster']['ElastiCacheProcessingUnits'] / clusterStats['cluster']['ecpu']) * 100 ) ) || 0 }
                                                                                                                    valueSufix={"%"}
                                                                                                                    title={""}
                                                                                                                    precision={0}
                                                                                                                    format={1}
                                                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                                                    fontSizeValue={"20px"}
                                                                                                                    height={"30px"}
                                                                                                                />
                                                                                                        </td>
                                                                                                        <td style={{"width": "30%", "text-align": "center" }}>
                                                                                                             <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ElastiCacheProcessingUnits','ElastiCacheProcessingUnits/sec')}>
                                                                                                                <CompMetric01 
                                                                                                                        value={clusterStats['cluster']['ElastiCacheProcessingUnits'] || 0}
                                                                                                                        title={"ElastiCacheProcessingUnits/sec"}
                                                                                                                        precision={0}
                                                                                                                        format={3}
                                                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                                                        fontSizeValue={"20px"}
                                                                                                                />
                                                                                                            </a>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td colspan="2" style={{"width": "100%" }}>
                                                                                                            <ChartBar01 series={JSON.stringify([
                                                                                                                                { name : "ElastiCacheProcessingUnits", data : clusterStats['cluster']['history']['ElastiCacheProcessingUnits'] }
                                                                                                                            ])}
                                                                                                                        title={""} height="150px" 
                                                                                                            />
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                </table>
                                                                                                
                                                                                            </td>
                                                                                            <td valign="top" style={{"width": "50%", }}>
                                                                                                <table style={{"width": "100%"}}>
                                                                                                    <tr>
                                                                                                        <td style={{"width": "33%", "text-align": "center" }}>
                                                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('TotalCmdsCount','TotalCmdsCount/sec')}>
                                                                                                                <CompMetric01 
                                                                                                                        value={clusterStats['cluster']['TotalCmdsCount'] || 0}
                                                                                                                        title={"TotalCmdsCount/sec"}
                                                                                                                        precision={0}
                                                                                                                        format={3}
                                                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                                                        fontSizeValue={"20px"}
                                                                                                                />
                                                                                                            </a>
                                                                                                        </td>
                                                                                                        <td style={{"width": "33%", "text-align": "center" }}>
                                                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('CurrConnections','CurrConnections')}>
                                                                                                                <CompMetric01 
                                                                                                                        value={clusterStats['cluster']['CurrConnections'] || 0}
                                                                                                                        title={"CurrConnections"}
                                                                                                                        precision={0}
                                                                                                                        format={3}
                                                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                                                        fontSizeValue={"20px"}
                                                                                                                />
                                                                                                            </a>
                                                                                                        </td>
                                                                                                        <td style={{"width": "33%", "text-align": "center" }}>
                                                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('NewConnections','NewConnections/sec')}>
                                                                                                                <CompMetric01 
                                                                                                                        value={clusterStats['cluster']['NewConnections'] || 0}
                                                                                                                        title={"NewConnections/sec"}
                                                                                                                        precision={0}
                                                                                                                        format={3}
                                                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                                                        fontSizeValue={"20px"}
                                                                                                                />
                                                                                                            </a>
                                                                                                        </td>
                                                                                                        <td style={{"width": "33%", "text-align": "center" }}>
                                                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ThrottledCmds','ThrottledCmds/sec')}>
                                                                                                                <CompMetric01 
                                                                                                                        value={clusterStats['cluster']['ThrottledCmds'] || 0}
                                                                                                                        title={"ThrottledCmds/sec"}
                                                                                                                        precision={0}
                                                                                                                        format={3}
                                                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                                                        fontSizeValue={"20px"}
                                                                                                                />
                                                                                                            </a>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td colspan="4">
                                                                                                                <ChartLine04 
                                                                                                                            series={JSON.stringify([
                                                                                                                                                        { name : "TotalCmdsCount", data : clusterStats['cluster']['history']['TotalCmdsCount'] },
                                                                                                                                                    ])}
                                                                                                                            title={""} height="170px" 
                                                                                                                />
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    
                                                                    <table style={{"width": "100%", "padding" : "0em" }}>
                                                                        <tr>  
                                                                            <td style={{"width": "45%", "padding-left": "1em", "padding-right": "1em", "text-align": "right"}}>
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('SuccessfulWriteRequestLatency','SuccessfulWriteRequestLatency(us)')}>
                                                                                    <CompMetric01 
                                                                                        value={clusterStats['cluster']['SuccessfulWriteRequestLatency'] || 0}
                                                                                        title={"WriteLatency(us)"}
                                                                                        precision={0}
                                                                                        format={3}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"20px"}
                                                                                    />
                                                                                </a>
                                                                            </td>
                                                                            <td style={{"width": "5%", "padding-left": "2px", "padding-right": "0em", "text-align": "left", }} >
                                                                                    <Animation01 />
                                                                            </td>
                                                                            <td style={{"width": "5%", "padding-left": "0em", "padding-right": "2px", "text-align": "right",  }}>
                                                                                    <Animation01 rotate="180deg" />
                                                                            </td>
                                                                            <td style={{"width": "45%", "padding-left": "1em", "padding-right": "1em", "text-align": "left"}}>
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('SuccessfulReadRequestLatency','SuccessfulReadRequestLatency(us)')}>
                                                                                    <CompMetric01 
                                                                                        value={clusterStats['cluster']['SuccessfulReadRequestLatency'] || 0}
                                                                                        title={"ReadLatency(us)"}
                                                                                        precision={0}
                                                                                        format={3}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"20px"}
                                                                                    />
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table style={{"width": "100%"}}>
                                                                        <tr>
                                                                            <td style={{"width": "100%", "padding-left": "1em", "padding-right": "1em", "border-radius": "10px", "border":  "5px solid" + configuration.colors.lines.separator101 }}>
                                                                                    <table style={{"width": "100%"}}>
                                                                                        <tr>
                                                                                            <td style={{"width": "50%" }}>
                                                                                                <Box variant="h2" color="text-status-inactive" >Memory Layer</Box>
                                                                                            </td>
                                                                                            <td style={{"width": "50%" }}>
                                                                                            </td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td valign="top" style={{"width": "50%", }}>
                                                                                                <table style={{"width": "100%"}}>
                                                                                                    <tr>
                                                                                                        <td style={{"width": "70%", }}>
                                                                                                            <ChartProgressBar01 
                                                                                                                value={ Math.round( ( (clusterStats['cluster']['BytesUsedForCache'] / ( clusterStats['cluster']['storage'] * 1024 * 1024 * 1024 )) * 100 )) || 0 }
                                                                                                                valueSufix={"%"}
                                                                                                                title={""}
                                                                                                                precision={0}
                                                                                                                format={1}
                                                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                                                fontSizeValue={"20px"}
                                                                                                                height={"30px"}
                                                                                                            />
                                                                                                        </td>
                                                                                                        <td style={{"width": "30%", "text-align": "center" }}>
                                                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('BytesUsedForCache','BytesUsedForCache')}>
                                                                                                                <CompMetric01 
                                                                                                                    value={clusterStats['cluster']['BytesUsedForCache'] || 0}
                                                                                                                    title={"BytesUsedForCache"}
                                                                                                                    precision={0}
                                                                                                                    format={2}
                                                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                                                    fontSizeValue={"20px"}
                                                                                                                />
                                                                                                            </a>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td colspan="2" style={{"width": "100%" }}>
                                                                                                            <ChartBar01 series={JSON.stringify([
                                                                                                                        { name : "BytesUsedForCache", data : clusterStats['cluster']['history']['BytesUsedForCache'] }
                                                                                                                    ])}
                                                                                                                title={""} height="150px" 
                                                                                                            />
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                </table>
                                                                                            </td>
                                                                                            <td valign="top" style={{"width": "50%", "text-align": "center" }}>
                                                                                                <table style={{"width": "100%"}}>
                                                                                                    <tr>
                                                                                                        <td style={{"width": "25%", "text-align": "left", "padding-left": "2em","padding-right": "2em", }}>
                                                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('CacheHitRate','CacheHitRate')}>
                                                                                                                <ChartProgressBar01 
                                                                                                                    value={ (clusterStats['cluster']['CacheHitRate']) || 0 }
                                                                                                                    valueSufix={"%"}
                                                                                                                    title={"CacheHitRate"}
                                                                                                                    precision={0}
                                                                                                                    format={1}
                                                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                                                    fontSizeValue={"20px"}
                                                                                                                />
                                                                                                            </a>
                                                                                                        </td>
                                                                                                        <td style={{"width": "25%", "text-align": "center" }}>
                                                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('CurrItems','CurrItems')}>
                                                                                                                <CompMetric01 
                                                                                                                        value={clusterStats['cluster']['CurrItems'] || 0}
                                                                                                                        title={"CurrItems"}
                                                                                                                        precision={0}
                                                                                                                        format={3}
                                                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                                                        fontSizeValue={"20px"}
                                                                                                                />
                                                                                                            </a>
                                                                                                        </td>
                                                                                                        <td style={{"width": "25%", "text-align": "center" }}>
                                                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('CurrVolatileItems','CurrVolatileItems')}>
                                                                                                                <CompMetric01 
                                                                                                                    value={clusterStats['cluster']['CurrVolatileItems'] || 0}
                                                                                                                    title={"CurrVolatileItems"}
                                                                                                                    precision={0}
                                                                                                                    format={3}
                                                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                                                    fontSizeValue={"20px"}
                                                                                                                />
                                                                                                            </a>
                                                                                                        </td>
                                                                                                        <td style={{"width": "25%", "text-align": "center" }}>
                                                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('Evictions','Evictions/sec')}>
                                                                                                                <CompMetric01 
                                                                                                                        value={clusterStats['cluster']['Evictions'] || 0}
                                                                                                                        title={"Evictions/sec"}
                                                                                                                        precision={0}
                                                                                                                        format={3}
                                                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                                                        fontSizeValue={"20px"}
                                                                                                                />
                                                                                                            </a>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td colspan="4">
                                                                                                                <ChartLine04 
                                                                                                                            series={JSON.stringify([
                                                                                                                                                        { name : "SuccessfulWriteRequestLatency", data : clusterStats['cluster']['history']['SuccessfulWriteRequestLatency'] },
                                                                                                                                                        { name : "SuccessfulReadRequestLatency", data : clusterStats['cluster']['history']['SuccessfulReadRequestLatency'] }
                                                                                                                                                    ])}
                                                                                                                            title={""} height="200px" 
                                                                                                                />
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    
                                                                    
                                                                    
                                                                    
                                                                    
                                                            </Container>
                                                                    
                                                
                                                        </td>
                                                    </tr>
                                                </table> 
                                                
                                          </>
                                          
                                      },
                                      {
                                        label: "Analytics Insight",
                                        id: "tab03",
                                        content: 
                                          
                                          <>    
                                                
                                                <table style={{"width":"100%", "padding": "1em"}}>
                                                    <tr>  
                                                        <td valign="top">
                                                            <Container>
                                                            
                                                                <table style={{"width":"100%", "padding": "1em"}}>
                                                                    <tr>  
                                                                        
                                                                        <td valign="top" style={{ "width":"30%", "padding": "1em"}}>
                                                                            <FormField
                                                                                  description="Select a metric to analyze the serverless cluster performance."
                                                                                  label="Performance Metric"
                                                                                >
                                                                                
                                                                                    <Select
                                                                                          selectedOption={selectedMetricAnalytics}
                                                                                          onChange={({ detail }) => {
                                                                                                 analyticsMetricName.current = { name : detail.selectedOption.value, factor : detail.selectedOption.factor, descriptions : detail.selectedOption.descriptions, unit : detail.selectedOption.unit };
                                                                                                 setSelectedMetricAnalytics(detail.selectedOption);
                                                                                                 gatherClusterStats();
                                                                                          }
                                                                                          }
                                                                                          options={analyticsMetrics}
                                                                                          filteringType="auto"
                                                                                    />
                                                                            </FormField>
                                                                        </td>
                                                                        <td valign="middle" style={{ "width":"15%","padding-left": "1em", "padding-right": "4em"}}>
                                                                                
                                                                            <FormField
                                                                              description="Period of time for analysis."
                                                                              label="Period"
                                                                            >
                                                                                
                                                                                <Select
                                                                                  selectedOption={selectedOptionInterval}
                                                                                  onChange={({ detail }) => {
                                                                                        analyticsInterval.current = detail.selectedOption.value;
                                                                                        setSelectedOptionInterval(detail.selectedOption);
                                                                                        gatherClusterStats();
                                                                                  }}
                                                                                  options={[
                                                                                    { label: "1 Hour", value: 1 },
                                                                                    { label: "3 Hours", value: 3 },
                                                                                    { label: "6 Hours", value: 6 },
                                                                                    { label: "12 Hours", value: 12 },
                                                                                    { label: "24 Hours", value: 24 },
                                                                                    { label: "7 Days", value: 168 }
                                                                                  ]}
                                                                                />
                                                                            
                                                                            </FormField>
                                                                                
                                                                        </td>
                                                                        <td style={{ "width":"55%","padding-left": "2em", "border-left": "4px solid " + configuration.colors.lines.separator100 }}>
                                                                                <Box variant="h4">{analyticsMetricName.current.name} ({analyticsMetricName.current.unit})</Box>
                                                                                <Box fontSize="body-s" color="text-body-secondary">{analyticsMetricName.current.descriptions}</Box>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                             
                                                                <table style={{"width":"100%", "padding": "1em"}}>
                                                                    <tr>  
                                                                        <td valign="top" style={{ "width":"10%","padding-left": "1em"}}>
                                                                            <CompMetric01 
                                                                                value={dataAnalytics.count || 0 }
                                                                                title={"Items"}
                                                                                precision={0}
                                                                                format={4}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"20px"}
                                                                            />
                                                                        </td>
                                                                        <td valign="top" style={{ "width":"10%","padding-left": "1em"}}>
                                                                            <CompMetric01 
                                                                                value={dataAnalytics.max || 0 }
                                                                                title={"Max"}
                                                                                precision={2}
                                                                                format={4}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"20px"}
                                                                            />
                                                                        </td>
                                                                        <td valign="top" style={{ "width":"10%","padding-left": "1em"}}>
                                                                             <CompMetric01 
                                                                                value={ dataAnalytics.avg || 0 }
                                                                                title={"Avg"}
                                                                                precision={2}
                                                                                format={4}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"20px"}
                                                                            />
                                                                        </td>
                                                                        <td valign="top" style={{ "width":"10%","padding-left": "1em"}}>
                                                                            <CompMetric01 
                                                                                value={dataAnalytics.min || 0 }
                                                                                title={"Min"}
                                                                                precision={2}
                                                                                format={4}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"20px"}
                                                                            />
                                                                        </td>
                                                                        <td valign="top" style={{ "width":"10%","padding-left": "1em"}}>
                                                                            <CompMetric01 
                                                                                value={dataAnalytics.p50 || 0}
                                                                                title={"p50"}
                                                                                precision={2}
                                                                                format={4}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"20px"}
                                                                            />
                                                                        </td>
                                                                        <td valign="top" style={{ "width":"10%","padding-left": "1em"}}>
                                                                             <CompMetric01 
                                                                                value={ dataAnalytics.p90 || 0 }
                                                                                title={"p90"}
                                                                                precision={2}
                                                                                format={4}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"20px"}
                                                                            />
                                                                        </td>
                                                                        <td valign="top" style={{ "width":"10%","padding-left": "1em"}}>
                                                                            <CompMetric01 
                                                                                value={dataAnalytics.p95 || 0}
                                                                                title={"p95"}
                                                                                precision={2}
                                                                                format={4}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"20px"}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                
                                                                <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                                    <tr>  
                                                                        <td valign="top" style={{ "width":"100%","padding-left": "1em"}}>
                                                                            <ChartLine05 series={JSON.stringify([
                                                                                                        { name : dataAnalytics.name, data : dataAnalytics.dataset }
                                                                                                    ])}
                                                                                                p50={dataAnalytics.p50}
                                                                                                p90={dataAnalytics.p90}
                                                                                                p95={dataAnalytics.p95}
                                                                                                avg={dataAnalytics.avg}
                                                                                                max={dataAnalytics.max}
                                                                                                title={""} height="400px" 
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <br/>
                                                                <br/>
                                                                <br/>
                                                                <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                                    <tr>  
                                                                        <td valign="top" style={{ "width":"50%","padding-left": "1em"}}>
                                                                            
                                                                            <ChartBar02 series={JSON.stringify([
                                                                                                        { name : dataAnalytics.name, data : dataAnalytics.datasetSorted }
                                                                                                    ])}
                                                                                                    p50={dataAnalytics.p50}
                                                                                                    p90={dataAnalytics.p90}
                                                                                                    p95={dataAnalytics.p95}
                                                                                                    avg={dataAnalytics.avg}
                                                                                                    max={dataAnalytics.max}
                                                                                                    title={""} height="300px" 
                                                                            />
                                                                            
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                
                                                            </Container>
                                                        
                                                        </td>
                                                    </tr>
                                                </table> 
                                            
                                          </>
                                          
                                      },
                                      {
                                        label: "Workload Analysis",
                                        id: "tab04",
                                        content: 
                                         
                                          <>
                                                
                                                                        
                                              <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                    <tr>  
                                                        <td>
                                                        
                                                        
                                                            <Container>
                                                            
                                                            <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                                <tr>  
                                                                    <td valign="top" style={{ "width":"50%","padding-left": "1em"}}>
                                                                        <table style={{"width":"100%","background-color ": "black"}}>
                                                                            <tr>  
                                                                                <td valign="top" style={{ "width":"80%"}}>
                                                                                    <FormField
                                                                                          description="Select a metric type to compare the performance for the different command types"
                                                                                          label="Performance Metric"
                                                                                        >
                                                                                        
                                                                                            <Select
                                                                                                  selectedOption={selectedCommandAnalytics}
                                                                                                  onChange={({ detail }) => {
                                                                                                         analyticsCommandName.current = detail.selectedOption.value;
                                                                                                         setSelectedCommandAnalytics(detail.selectedOption);
                                                                                                         gatherClusterStats();
                                                                                                  }
                                                                                                  }
                                                                                                  options={analyticsCommands}
                                                                                                  filteringType="auto"
                                                                                            />
                                                                                          
                                                                                    </FormField>
                                                                                </td>
                                                                                <td valign="top" style={{ "width":"20%","padding-left": "1em"}}>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                        <br/>
                                                                        <ChartPolar01 
                                                                                title={"Performance Analysis"} 
                                                                                height="450px" 
                                                                                width="100%" 
                                                                                series = {clusterStats['cluster']['analytics']['series']}
                                                                                labels = {clusterStats['cluster']['analytics']['labels']}
                                                                                onClickEvent={onClickPolarChart}
                                                                        />
                                                                    </td>
                                                                    <td valign="middle" style={{ "width":"50%","padding-left": "2em", "border-left": "1px solid " + configuration.colors.lines.separator100}}>
                                                                        
                                                                        <ChartLine04 
                                                                            series={JSON.stringify( clusterStats['cluster']['analytics']['data'] )}
                                                                            title={""} height="350px" 
                                                                        />
                                                                                    
                                                                                    
                                                                                
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            
                                                            </Container>
                                                        
                                                        </td>
                                                    </tr>
                                                </table> 
                                                
                                                
                                                
                                          </>
                                          
                                      },
                                      {
                                        label: "Cluster Information",
                                        id: "tab05",
                                        content: 
                                         
                                          <>
                                                 
                                              <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                    <tr>  
                                                        <td>
                                                                <Container>
                                                                    <ColumnLayout columns={4} variant="text-grid">
                                                                      <div>
                                                                            <Box variant="awsui-key-label">Cluster name</Box>
                                                                            <div>{parameter_object_values['rds_id']}</div>
                                                                      </div>
                                                                      <div>
                                                                            <Box variant="awsui-key-label">Capacity</Box>
                                                                            <div>{parameter_object_values['rds_size']}</div>
                                                                      </div>
                                                                      <div>
                                                                            <Box variant="awsui-key-label">ConfigurationEndpoint</Box>
                                                                            <div>{parameter_object_values['rds_host']}</div>
                                                                      </div>
                                                                      <div>
                                                                            <Box variant="awsui-key-label">Port</Box>
                                                                            <div>{parameter_object_values['rds_port']}</div>
                                                                      </div>
                                                                    </ColumnLayout>
                                                                    <br/>
                                                                    <br/>
                                                                    <ColumnLayout columns={4} variant="text-grid">
                                                                        <div>
                                                                            <Box variant="awsui-key-label">Status</Box>
                                                                            <div>{clusterStats['cluster']['status']}</div>
                                                                        </div>
                                                                        <div>
                                                                            <Box variant="awsui-key-label">AutheticationMode</Box>
                                                                            <div>{parameter_object_values['rds_auth']}</div>
                                                                        </div>
                                                                        <div>
                                                                            <Box variant="awsui-key-label">ConnectionId</Box>
                                                                            <div>{clusterStats['cluster']['connectionId']}</div>
                                                                        </div>
                                                                    </ColumnLayout>
                                                                  </Container>
                                                
                                                        </td>
                                                    </tr>
                                                </table> 
                                                
                                          </>
                                          
                                      },
                                      ]}
                        />

                            
                            
                            

        </>
        }
        
         />
         
    </div>
  );
}

export default App;

