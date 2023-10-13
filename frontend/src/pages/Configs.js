
export const configuration = 
{
    "apps-settings": {
        "refresh-interval": 10*1000,
        "refresh-interval-clw": 20*1000,
        "refresh-interval-elastic": 5*1000,
        "refresh-interval-documentdb-metrics": 10*1000,
        "refresh-interval-documentdb-sessions": 10*1000,
        "items-per-page-documentdb": 10,
        "refresh-interval-aurora-pgs-sessions": 10*1000,
        "items-per-page-aurora-pgs": 10,
        "api_url": "",
        "release" : "0.1.0",
        "release-enforcement" : false,
        "application-title": "DBTop Monitoring",
        "version-code-url" : "https://version.code.ds.wwcs.aws.dev/",
        "items-per-page": 10
    },
    "colors": {
        "fonts" : {
            "metric102" : "#4595dd",
            "metric101" : "#e59400",
            "metric100" : "#e59400",
        },
        "lines" : {
            "separator100" : "#737c85",
            "separator101" : "red"
        }
    }
};

export const SideMainLayoutHeader = { text: 'Database Services', href: '#/' };

export const SideMainLayoutMenu = [
    { type: "link", text: "Home", href: "/" },
    {
      text: 'Resources',
      type: 'section',
      defaultExpanded: true,
      items: [
        { type: 'link', text: 'RDS Instances', href: '/rds/instances/' },
        { type: 'link', text: 'Aurora Clusters', href: '/clusters/aurora/'},
        { type: 'link', text: 'MemoryDB Clusters', href: '/clusters/memorydb/'},
        { type: 'link', text: 'ElastiCache Clusters for Redis', href: '/clusters/elasticache/' },
        { type: 'link', text: 'DocumentDB Clusters', href: '/clusters/documentdb'},
      ],
    },
    { type: "divider" },
    {
          type: "link",
          text: "Documentation",
          href: "https://github.com/aws-samples/db-top-monitoring",
          external: true,
          externalIconAriaLabel: "Opens in a new tab"
    }
  ];


export const breadCrumbs = [{text: 'Service',href: '#',},{text: 'Resource search',href: '#',},];



  