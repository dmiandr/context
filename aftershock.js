let ashInstruct = {"shortname": "aftershock", "urls": ["aftershock.news"], "title": "АШ",
"procedure": [
{"queryaz": '[class~="aft-postauthoricon"]',        // Автор публикациии
"username": [{"name": "up", "param": {"case": [{"name": "classcontains","param": "aft-postheadericons"}] } },
             {"name": "down", "param": {"case": [{"name": "classcontains","param": "username"} ] } },
             {"name": "attr", "param": "href"}, {"name": "match", "param": "user\/(\\d+)"} ],
"eventype": [ {"name": "const","param": "2"} ],
"isModifiable": [ {"name": "up", "param": {"case": [{"name": "classcontains","param": "aft-article"}] } },
{"name": "down", "param": {"case": [{"name": "classcontains","param": "aft-postheadericon"}] } },
{"name": "down", "param": {"case": [{"name": "tag","param": "[A,a]"}] } }, {"name":"set", "param": "urlelem"}, {"name": "iseq", "param": null}, 
{"name": "if", "param": [
{"name": "const","param": true}],
"altparam": [{"name": "const","param": false}]
} ],
"url":  [ {"name": "up", "param": {"case": [{"name": "classcontains","param": "aft-article"}] } },
{"name": "down", "param": {"case": [{"name": "classcontains","param": "aft-postheadericon"}] } },
{"name": "down", "param": {"case": [{"name": "tag","param": "[A,a]"}] } }, {"name":"set", "param": "urlelem"}, {"name": "iseq", "param": null}, 
{"name": "if", "param": [
{"name": "queryselector","param": 'meta[name="twitter:url"]'}, {"name": "attr", "param": "content"}],
"altparam": [{"name":"get", "param": "urlelem"}, {"name": "attr", "param": "href"}, {"name": "concatbefore", "param": "https://aftershock.news"}]
} ],
"captElement": [{"name": "up", "param": {"case": [{"name": "classcontains","param": "aft-article"}] } },
{"name": "down", "param": {"case": [{"name": "classcontains","param": "aft-postheadericon"}] } },
{"name": "down", "param": {"case": [{"name": "tag","param": "[A,a]"}] } }, {"name":"set", "param": "urlelem"}, {"name": "iseq", "param": null}, 
{"name": "if", "param": [ {"name": "init"}, 
{"name": "up", "param": {"case": [{"name": "classcontains","param": "aft-article"}] } },
              {"name": "down", "param": {"case": [{"name": "classcontains","param": "aft-postheadericon"} ] } }],
"altparam": [{"name":"get", "param": "urlelem"}]
}],
"totalblock": [{"name": "queryselector","param": 'meta[name="twitter:url"]'}, {"name": "iseq","param": null}, {"name": "if", 
    "altparam": [{"name": "const","param": null}, {"name": "return"}],
    "param": [{"name": "init"}, {"name": "up", "param": {"case": [{"name": "classcontains","param": "node-blog"}]}} ] }]  
},
{"queryaz": '[class~="aft-comment"]',
"eventype": [ {"name": "const","param": "1"} ],
"username": [{"name": "down", "param": {"case": [{"name": "classcontains","param": "username"} ] } }, 
            {"name": "attr", "param": "href"}, {"name": "match", "param": "user\/(\\d+)"}],
"isModifiable": [{"name": "const","param": true}],
"url": [ {"name": "attr", "param": "about"}, {"name": "concatbefore", "param": "https://aftershock.news"} ],
"attachMenuDomElement": [{"name": "down", "param": {"case": [{"name": "classcontains","param": "username"} ] } }],
"captElement": [{"name": "down", "param": {"case": [{"name": "classcontains","param": "username"} ] } }],
"attachBadge": [{"name": "down", "param": {"case": [{"name": "classcontains","param": "username"} ] } }],
"userelem": [{"name": "down", "param": {"case": [{"name": "classcontains","param": "username"} ] } }],
"totalblock": [{"name": ""}]
}
  ],
"functions": {
  "getimestamp": [ {"doctcondition": [{"name": "iseq","param": "2"}], "timestampstring": [ {"name": "up", "param": {"case": [{"name": "classcontains","param": "aft-postheadericons"}] } },
    {"name": "down", "param": {"case": [{"name": "classcontains","param": "aft-postdateicon"} ] } }, {"name": "in"}, {"name": "set", "param": "origtime"},
    {"name": "match", "param": "\\d{1,2}\/\\S{3}\/(\\d{2})"}, {"name": "concatbefore", "param": "20"}, {"name": "set", "param": "years"}, {"name": "get", "param": "origtime"},
    {"name": "match", "param": "\\d{1,2}\/(\\S{3})\/\\d{2}"}, {"name": "monthtonumber"}, {"name": "set", "param": "months"}, {"name": "get", "param": "origtime"},
    {"name": "match", "param": "(\\d{1,2})\/\\S{3}\/\\d{2}"}, {"name": "set", "param": "days"}, {"name": "get", "param": "origtime"},
    {"name": "match", "param": "(\\d{2}):\\d{2}"}, {"name": "set", "param": "hours"}, {"name": "get", "param": "origtime"},
    {"name": "match", "param": "\\d{2}:(\\d{2})"}, {"name": "set", "param": "minutes"}, {"name": "createzerodate"},
    {"name": "setyear", "param": [{"name": "get", "param": "years"}]},
    {"name": "setmonths", "param": [{"name": "get", "param": "months"}]},
    {"name": "setdays", "param": [{"name": "get", "param": "days"}]},
    {"name": "sethours", "param": [{"name": "get", "param": "hours"}]},
    {"name": "setminutes", "param": [{"name": "get", "param": "minutes"}]},
    {"name": "set","param": "parcedtime"},
    {"name": "const","param": true},
    {"name": "set","param": "success"},
    {"name": "return","param": "values"}
    ]},
    { "doctcondition": [{"name": "iseq","param": "1"}], "timestampstring": [ {"name": "down", "param": {"case": [{"name": "classcontains","param": "comment_date"} ] } },  
                        {"name": "attr", "param": "data-date"}, {"name": "epochtime"}, {"name": "set","param": "parcedtime"}, 
                        {"name": "init"}, {"name": "down", "param": {"case": [{"name": "classcontains","param": "comment_date"}]}}, {"name": "in"}, {"name": "set", "param": "origtime"},
                        {"name": "const","param": true}, {"name": "set","param": "success"}, {"name": "return","param": "values"}] }],
"gettext": [{ "doctcondition": [{"name": "iseq","param": "1"}], "eventtexts" : [ {"name": "down", "param": {"case": [{"name": "classcontains","param": "field-name-comment-body"} ] } },
            {"name": "in"}, {"name": "set", "param": "evtext"}, {"name": "const", "param": ""}, {"name": "set","param": "evtitle"}, {"name": "return","param": "values"}]},
            { "doctcondition": [{"name": "iseq","param": "2"}], "eventtexts" : [{"name": "up", "param": {"case": [{"name": "classcontains","param": "aft-article"}] } },
              {"name": "down", "param": {"case": [{"name": "classcontains","param": "aft-postheadericon"} ] } }, {"name": "in"}, {"name": "set","param": "evtitle"},
              {"name": "init"}, {"name": "up", "param": {"case": [{"name": "classcontains","param": "content"}] } },
              {"name": "down", "param": {"case": [{"name": "classcontains","param": "aft-postcontent"} ] } },
              {"name": "down", "param": {"case": [{"name": "classcontains","param": "field-item"} ] } },
              {"name": "in"}, {"name": "set", "param": "evtext"},
              {"name": "return","param": "values"}
        ] }
    ],
"getuseralias": [{"doctcondition": [{"name": "iseq","param": "2"}], "useralias": [{"name": "up", "param": {"case": [{"name": "classcontains","param": "aft-postheadericons"}] } },
             {"name": "down", "param": {"case": [{"name": "classcontains","param": "username"} ] } }, {"name": "in"}]  },
                { "doctcondition": [{"name": "iseq","param": "1"}], "useralias": [{"name": "down", "param": {"case": [{"name": "classcontains","param": "username"} ] } }, {"name": "in"}] }],
"getrootlink": [{ "rootlink": [{"name": "queryselector","param": 'meta[name="twitter:url"]'}, {"name": "attr", "param": "content"}]  }]
    
  }
}

AllSocProcs.set("АШ", ashInstruct);
