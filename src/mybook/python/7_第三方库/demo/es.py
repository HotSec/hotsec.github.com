from elasticsearch8 import Elasticsearch
from rich import print_json
from rich.console import Console
import warnings
warnings.filterwarnings("ignore")

console = Console()
from loguru import logger
es = Elasticsearch(hosts=["https://192.168.10.167:9200"],basic_auth=('elastic', 'test123'), verify_certs=False)

logger.info(es.cluster.health())
# rprint(es.cluster.state())

# 查看集群节点信息
# curl  -u elastic:test123 -X GET "https://192.168.10.167:9200/_cat/nodes?v&pretty" -k
# logger.info(es.nodes.info())

# # 查看索引列表
# # curl  -u elastic:test123 -X GET "https://192.168.10.167:9200/_cat/indices?v&pretty" -k
# alias = es.indices.get_alias()
# for k,v in alias.items():
#     logger.info(f"{k} {v}")
    
# # 查看索引的mapping

# mapping = es.indices.get_mapping(index="task_result_nginx_sim_nginx_8.log")
# logger.info(mapping)

# # 查看索引的setting
# setting = es.indices.get_settings(index="task_result_nginx_sim_nginx_8.log")
# logger.info(setting)

# 查询
# curl -u elastic:test123 -X GET "https://192.168.10.167:9200/task_result_nginx_sim_nginx_8.log/_search?q=host:192.168.10.167&pretty" -k
resp = es.search(index="task_result_nginx_sim_nginx_8.log",body={"query": {"wildcard": {"name": "*文件*"}}})
# console.print(resp)

query = {
    "bool": {
        "must": [
            {
                "bool": {
                    "must_not": {
                        "term": {
                            "name": "123"
                        }
                    }
                }
            },
            {
                "term": {
                    "client_ip": "223.104.164.9/24"
                }
            },
            {
                "bool": {
                    "must_not": {
                        "term": {
                            "name": "123"
                        }
                    }
                }
            },
            {
                "bool": {
                    "must": [
                        {
                            "range": {
                                "client_ip": {
                                    "gte": "223.104.164.9",
                                    "lte": "223.104.164.90"
                                }
                            }
                        },
                        {
                            "term": {
                                "server_ip": "223.104.164.124/24"
                            }
                        },
                        {
                            "regexp": {
                                "client_ip": {
                                    "value": ".*223.104.164..*"
                                }
                            }
                        }
                    ]
                }
            }
        ]
    }
}

query = {'query': {'bool': {'must': [{'range': {'client_ip': {'gte': '211.90.239.7', 'lte': '211.90.239.255'}}}]}}, 'from': 0, 'size': 10, 'sort': [{'@timestamp': {'order': 'desc'}}], 'track_total_hits': True}
# 
# resp = es.search(index="task_result_5f7832ac-151b-46eb-8d23-de71e0a2e95f", body=query)
# console.print(resp)

# 添加别名
# es.indices.put_alias(index="task_result_5f7832ac-151b-46eb-8d23-de71e0a2e95f", name="new_95e691d4-ca14-4e84-8b95-d2e4ed28f8ef_task_result")

resp = es.search(index="new_95e691d4-ca14-4e84-8b95-d2e4ed28f8ef_task_result", body=query)
console.print(resp)