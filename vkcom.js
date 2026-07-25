let vkInstruct = {"shortname": "vkcom", "urls": ["vk.com", "m.vk.com"], "title": "ВК",
"procedure": [
{"queryaz": 'a[class~="author"]',
"username": [{"name": "func","param": "usernamebytag"}, {"name": "iseq","param": null}, {"name": "if", "param":[{"name": "init"},{"name": "func", "param": "usernamebyhref"}, {"name": "return"}] }  ],
"eventype": [{"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "pv_photo_wrap"} ] } }, {"name": "iseq", "param": null}, {"name": "if", 
    "altparam": [{"name": "const","param": "0"}], 
    "param": [{"name": "init"}, {"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "reply_content"} ] }   },  {"name": "iseq", "param": null}, {"name": "if", 
        "altparam": [{"name": "const","param": "1"}], 
        "param": [{"name": "const","param": "2"}]
    } ] 
    } ],
"isModifiable": [{"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "pv_photo_wrap"} ] } }, {"name": "iseq", "param": null}, {"name": "if", 
    "altparam": [{"name": "const","param": false}], 
    "param": [{"name": "const","param": true}]
    }],
"url": [{"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "pv_photo_wrap"} ] } }, 
    {"name": "iseq", "param": null}, 
        {"name": "if", 
        "altparam": [{"name": "const","param": ""}, {"name": "return"}],
        "param": [{"name": "init"}, {"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "reply_content"} ] } }, 
                     {"name": "iseq", "param": null}, {"name": "if", "altparam": [      // eventype = 1
                       {"name": "init"}, {"name": "up","param": {"case":[ {"name": "attr","param": "class"}, {"name": "test","param": "mv_comments"} ] }},
                       {"name": "iseq", "param": null}, {"name": "if", 
                         "param": [{"name": "init"}, {"name": "up","param": {"case":[ {"name": "attr","param": "class"}, {"name": "test","param": "reply_content"} ] }},
                                    {"name": "down","param": {"case":[ {"name": "attr","param": "class"}, {"name": "test","param": "reply_footer"} ] }},
                                    {"name": "down","param": {"case":[ {"name": "attr","param": "class"}, {"name": "test","param": "reply_date"} ] }},
                                    {"name": "down","param": {"case":[ {"name": "attr","param": "class"}, {"name": "test","param": "wd_lnk"} ] }},
                                    {"name": "set","param": "linkblock" }, {"name": "iseq", "param": null}, {"name": "if", 
                                      "altparam": [ {"name": "get","param": "linkblock" }, {"name": "attr","param": "href" }, {"name": "return"} ] }
                                ],                         
                         "altparam": [{"name": "init"}, {"name": "up","param": {"case":[ {"name": "attr","param": "class"}, {"name": "test","param": "reply_dived"} ] }},
                                       {"name": "attr", "param": "id"}, {"name": "set", "param": "commid"}, {"name": "iseq", "param": null}, 
                                       {"name": "if", "param": [{"name": "const", "param": null},{"name": "return"}], 
                                                      "altparam": [ {"name": "url", "param": "noparams"},
                                                      {"name": "concatafter", "param": "#" },
                                                      {"name": "concatafter", "param": [{"name": "get", "param": "commid"}] },
                                                      {"name": "return"} ]
                                       }
                                ] }
                        
                     ],
                     "param": [                     // eventype = 2
                     
                     ]
                     }
                ]
        },
    ],
"totalblock": [{"name": "up","param": {"case": [ {"name": "classcontains","param": "reply_dived"}]}}]
},
{"queryaz": 'a[class="PostHeaderTitle__authorLink"],a[class="pi_author"]',
"username": [{"name": "func","param": "usernamebytag"}, {"name": "iseq","param": null}, {"name": "if", "param":[{"name": "init"},{"name": "func", "param": "usernamebyhref"}, {"name": "return"}] }  ],
"eventype": [{"name": "const","param": "2"}],
"isModifiable": [{"name": "const","param": true}],
"attachBadgeMode": [{"name": "const","param": "after"}],
"attachMenuDomElement": [{"name": "up","param": {"case": [ {"name": "classcontains","param": "PostHeaderTitle"}]}} ],
"attachBadge": [{"name": "up","param": {"case": [{"name": "classcontains","param": "PostHeader"}]}},
                {"name": "down","param": {"case": [{"name": "classcontains","param": "AvatarRichContainer"} ] } } ],
"url": [{"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "pv_photo_wrap"} ] } }, {"name": "iseq", "param": null}, {"name": "if", 
    "altparam": [{"name": "const","param": ""}], 
    "param": [{"name": "init"}, {"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "reply_content"} ] }   },  {"name": "iseq", "param": null}, {"name": "if", 
        "altparam": [{"name": "init"}, {"name": "func","param": "geteventurltype1"}], 
        "param": [{"name": "init"}, {"name": "func","param": "geteventurltype2"}]
    } ] 
    } ]
},
{"queryaz": 'a[class~="vkitPostHeaderTitle__root--RpTRm"]',
"username": [{"name": "func", "param": "usernamebyhref"}],
"eventype": [{"name": "const","param": "2"}],
"isModifiable": [{"name": "const","param": true}],
"url": [{"name": "queryselector","param": 'div[class~="basis__content"]'}, {"name": "attr","param": "data-canonical"}],
"attachMenuDomElement": [{"name": "up","param": {"case": [{"name": "classcontains","param": "vkuiFlex__directionColumn"}]}}]
},
{"queryaz": 'a[class~="vkitCommentBaseOwnerName__ownerNameLink--eqBxt"]',
"eventype": [{"name": "const","param": "1"}],
"isModifiable": [{"name": "const","param": true}],
"username": [{"name": "func", "param": "usernamebyhref"}],
"url": [{"name": "up","param": {"case": [{"name": "classcontains","param": "vkitCommentBase__in--9swaG"}]}}, 
        {"name": "down","param": {"case": [{"name": "classcontains","param": "vkitComment__date--6PSiG"}]}}, 
        {"name": "down","param": {"case": [{"name": "classcontains","param": "vkitLink__link--b0dQw"}]}},
        {"name": "attr", "param": "href"}, {"name": "concatbefore", "param": "https://vk.com"} ],
"attachBadgeMode": [{"name": "const","param": "after"}],
"totalblock": [{"name": "up","param": {"case": [{"name": "classcontains","param": "vkitCommentBase__root--tipbq"}]}}]
}

],
"functions": {
"usernamebytag": [
	{"name": "attr","param": "mention_id"},
	{"name": "test","param": "(?!^$)"},
	{"name": "if", "param": [
		{"name": "init"},
		{"name": "attr","param": "mention_id"},
		{"name": "replace", "param": ["club", "public"]},
		{"name": "return"}
	]},
{"name": "init"}, 
{"name": "attr","param": "data-from-id"}, 
{"name": "test","param": "(?!^$)"},
{"name": "if", "param": [
	{"name": "init"}, 
	{"name": "attr","param": "data-from-id"}, 
	{"name": "test", "param": "^-.*$"}, 
	{"name": "if", "param":[
		{"name": "init"}, 
		{"name": "attr","param": "data-from-id"}, 
		{"name": "replace", "param": ["-", "public"]}, 
		{"name": "return"}
		], 
		"altparam": [
		{"name": "init"}, 
		{"name": "attr","param": "data-from-id"}, 
		{"name": "concatbefore", "param": "id"}, 
		{"name": "return"}]
	}]
} ],  // END usernamebytag
"usernamebyhref": [{"name": "attr", "param": "href"}, {"name": "match","param": "^\/([a-zA-Z0-9_.-]+)"}, {"name": "set","param": "uname"}, {"name": "test","param": "(?!^$)"}, 
    {"name": "if", "altparam": [
        {"name": "init"}, {"name": "attr", "param": "href"}, {"name": "match","param": "vk.com\/([a-zA-Z0-9_.-]+)"}], 
                  "param": [{"name": "get","param": "uname"}] } ] // usernamebyhref VERIFIED

,
"getimestamp": [{
    "doctcondition": [{"name": "iseq","param": "1"}],
    "timestampstring": [ {"name": "ismobile"}, {"name": "if", "altparam": [{"name": "init"}, {"name": "up","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "reply_content"}]}},
                        {"name": "down","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "reply_footer"}]}},
                        {"name": "down","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "reply_date"}]}},
                        {"name": "set", "param": "dateblock"},
                        {"name": "down","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "wd_lnk"}]}},
                        {"name": "iseq","param": null}, {"name": "if", "param": [
                            {"name": "get", "param": "dateblock"},
                            {"name": "in"},
                            {"name": "set", "param": "origtime"},   // Сохранение исходного текста даты
                            {"name": "get", "param": "dateblock"},
                            {"name": "attr","param": "time"},
                            {"name": "isnoteq", "param": ""},
                            {"name": "if", "param":[{"name": "get", "param": "dateblock"}, 
                                                    {"name": "attr","param": "time"}, 
                                                    {"name": "epochtime"}, 
                                                    {"name": "set","param": "parcedtime"},
                                                    {"name": "const","param": true},
                                                    {"name": "set","param": "success"},
                                                    {"name": "return","param": "values"}],
                                           "altparam": [{"name": "get", "param": "dateblock"},
                                                        {"name": "in"},
                                                        {"name": "vktime"},
                                                        {"name": "set","param": "parcedtime"},
                                                        {"name": "const","param": true},
                                                        {"name": "set","param": "success"},
                                                        {"name": "return","param": "values"}] }],
                        "altparam": [
                            {"name": "get", "param": "dateblock"},
                            {"name": "down","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "wd_lnk"}]}},
                            {"name": "down","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "rel_date"}]}},
                            {"name": "set", "param": "datespan"},
                            {"name": "iseq","param": null}, {"name": "if", "param": [{"name": "curdate"},
                                                                                     {"name": "set","param": "parcedtime"},
                                                                                     {"name": "const","param": ""},
                                                                                     {"name": "set", "param": "origtime"},
                                                                                     {"name": "const","param": false},
                                                                                     {"name": "set","param": "success"},
                                                                                     {"name": "return","param": "values"}],
                            "altparam": [ 
                                {"name": "get", "param": "datespan"},
                                {"name": "in"},
                                {"name": "set", "param": "origtime"},
                                {"name": "get", "param": "datespan"},
                                {"name": "attr","param": "time"},
                                {"name": "isnoteq", "param": ""},
                                {"name": "if", "param":[{"name": "get", "param": "datespan"}, 
                                                        {"name": "attr","param": "time"}, 
                                                        {"name": "epochtime"},
                                                        {"name": "set","param": "parcedtime"},
                                                        {"name": "const","param": true},
                                                        {"name": "set","param": "success"},
                                                        {"name": "return","param": "values"}],
                                           "altparam": [{"name": "get", "param": "datespan"}, 
                                                        {"name": "in"}, 
                                                        {"name": "vktime"},
                                                        {"name": "set","param": "parcedtime"},
                                                        {"name": "const","param": true},
                                                        {"name": "set","param": "success"},
                                                        {"name": "return","param": "values"}] }
                                ] // end altparam 
                                }
                            ]
                        } ], "param":[ {"name": "init"}, {"name": "up","param": {"case": [ {"name": "classcontains","param": "vkitCommentBase__in--9swaG"}]}},     // Mobile version
                                       {"name": "down","param": {"case": [{"name": "classcontains","param": "vkitComment__date--6PSiG"}]}}, 
                                       {"name": "down","param": {"case": [{"name": "classcontains","param": "vkitLink__link--b0dQw"}]}},
                                       {"name": "in"}, {"name": "set", "param": "origtime"},
                                       {"name": "vktime"}, {"name": "set","param": "parcedtime"},
                                       {"name": "const","param": true}, {"name": "set","param": "success"},
                                       {"name": "return","param": "values"}  ] 
                                }
                   ]
    },
    {
        "doctcondition": [{"name": "iseq","param": "2"}],
        "timestampstring": [ {"name": "ismobile"}, {"name": "if", "altparam": [{"name": "init"}, {"name": "up","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "mv_info"}]}},
        {"name": "set", "param": "mvinfo"},
        {"name": "iseq","param": null},
        {"name": "if", 
        "param": [{"name": "init"}, {"name": "up","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "_post_content"}]}},
                     {"name": "set", "param": "comblock"},
                     {"name": "iseq","param": null},
                     {"name": "if", "param":[{"name": "init"}, {"name": "up","param": {"case": [{"name": "attr","param": "id"}, {"name": "test","param": "wk_content"}]}}, {"name": "set", "param": "comblock"}]},
                     {"name": "get", "param": "comblock"},
                     {"name": "down","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "PostDateBlock__root"}]}},
                     {"name": "set", "param": "datespan"},
                     {"name": "iseq","param": null},
                     {"name": "if", "param":[{"name": "curdate"}, {"name": "set","param": "parcedtime"},{"name": "const","param": ""},{"name": "set", "param": "origtime"},{"name": "const","param": false},{"name": "set","param": "success"},{"name": "return","param": "values"}],
                                    "altparam": [{"name": "get", "param": "datespan"},
                                                 {"name": "in"},
                                                 {"name": "set", "param": "origtime"},
                                                 {"name": "get", "param": "datespan"},
                                                 {"name": "attr","param": "time"},
                                                 {"name": "isnoteq", "param": ""},
                                                 {"name": "if", "param":[{"name": "get", "param": "datespan"},
                                                                         {"name": "attr","param": "time"},
                                                                         {"name": "epochtime"},
                                                                         {"name": "set","param": "parcedtime"},
                                                                         {"name": "const","param": true},
                                                                         {"name": "set","param": "success"},
                                                                         {"name": "return","param": "values"}],
                                                                "altparam": [{"name": "get", "param": "datespan"},
                                                                             {"name": "in"},
                                                                             {"name": "vktime"},
                                                                             {"name": "set","param": "parcedtime"},
                                                                             {"name": "const","param": true},
                                                                             {"name": "set","param": "success"},
                                                                             {"name": "return","param": "values"}] }
                                                ]
                    }],
        "altparam": [{"name": "get", "param": "mvinfo"},
                     {"name": "down","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "VideoLayerInfo__date"}]}},
                     {"name": "set", "param": "videolayer"},
                     {"name": "iseq","param": null},
                     {"name": "if", "param":[{"name": "curdate"}, {"name": "set","param": "parcedtime"},{"name": "const","param": ""},{"name": "set", "param": "origtime"},{"name": "const","param": false},{"name": "set","param": "success"},{"name": "return","param": "values"}],
                        "altparam": [{"name": "get", "param": "datespan"},
                                     {"name": "in"},
                                     {"name": "set", "param": "origtime"},
                                     {"name": "get", "param": "datespan"},
                                     {"name": "attr","param": "time"},
                                     {"name": "isnoteq", "param": ""},
                                     {"name": "if", "param":[{"name": "get", "param": "datespan"},
                                                             {"name": "attr","param": "time"},
                                                             {"name": "epochtime"},
                                                             {"name": "set","param": "parcedtime"},
                                                             {"name": "const","param": true},
                                                             {"name": "set","param": "success"},
                                                             {"name": "return","param": "values"}],
                                                    "altparam": [{"name": "get", "param": "datespan"},
                                                                 {"name": "in"},
                                                                 {"name": "vktime"},
                                                                 {"name": "set","param": "parcedtime"},
                                                                 {"name": "const","param": true},
                                                                 {"name": "set","param": "success"},
                                                                 {"name": "return","param": "values"}] }
                     ]}
                    ]
        } ], "param": [{"name": "init"}, {"name": "up","param": {"case": [ {"name": "classcontains","param": "PopupRoot__wrapper--JNmho"}]}}, // Mobile version
                       {"name": "down","param": {"case":[ {"name": "attr","param": "data-testid"}, {"name": "test","param": "post_date_block_preview"} ] }},
                       {"name": "in"}, {"name": "set", "param": "origtime"}, {"name": "vktime"}, {"name": "set","param": "parcedtime"}, 
                       {"name": "const","param": true}, {"name": "set","param": "success"}, {"name": "return","param": "values"}
          ] }
        ]
    }
    ],
    "geteventurltype1": [{"name": "iseq", "param": null}, {"name": "if", 
                         "param": [{"name": "init"}, {"name": "up","param": {"case":[ {"name": "attr","param": "class"}, {"name": "test","param": "reply_content"} ] }},
                                    {"name": "down","param": {"case":[ {"name": "attr","param": "class"}, {"name": "test","param": "reply_footer"} ] }},
                                    {"name": "down","param": {"case":[ {"name": "attr","param": "class"}, {"name": "test","param": "reply_date"} ] }},
                                    {"name": "down","param": {"case":[ {"name": "attr","param": "class"}, {"name": "test","param": "wd_lnk"} ] }},
                                    {"name": "set","param": "linkblock" }, {"name": "iseq", "param": null}, {"name": "if", 
                                      "altparam": [ {"name": "get","param": "linkblock" }, {"name": "attr","param": "href" }, {"name": "return"} ] }
                                ],                         
                         "altparam": [{"name": "init"}, {"name": "up","param": {"case":[ {"name": "attr","param": "class"}, {"name": "test","param": "reply_dived"} ] }},
                                       {"name": "attr", "param": "id"}, {"name": "set", "param": "commid"}, {"name": "iseq", "param": null}, 
                                       {"name": "if", "param": [{"name": "const", "param": null},{"name": "return"}], 
                                                      "altparam": [ {"name": "url", "param": "noparams"},
                                                      {"name": "concatafter", "param": "#" },
                                                      {"name": "concatafter", "param": [{"name": "get", "param": "commid"}] },
                                                      {"name": "return"} ]
                                       }
                                ] }],
    "geteventurltype2": [ {"name": "up","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "mv_info"}]}},
                          {"name": "iseq","param": null},
                          {"name": "if", 
                            "param":[{"name": "init"}, {"name": "attr", "param": "data-post-id"}, {"name": "concatbefore", "param": "https://vk.com/wall"}, {"name": "return"}],
                            "altparam": [ {"name": "url", "param": "noparams"} ] }
 ],
    "getuseralias": [ {"doctcondition": [{"name": "iseq","param": "2"}],  "useralias": [ {"name": "in"}, 
                                                                                         {"name": "match","param": "^\\s*(.*?)\\s*$"}, 
                                                                                         {"name": "concatafter", "param": " ("}, 
                                                                                         {"name": "concatafter", "param": [{"name": "init"}, {"name": "func","param": "usernamebyhref"}]}, 
                                                                                         {"name": "concatafter", "param": ")"} ]},
                      {"doctcondition": [{"name": "iseq","param": "1"}],  "useralias": [ {"name": "ismobile"}, {"name": "if", "altparam": [  
                                                                                         {"name": "init"}, {"name": "firstchild"}, 
                                                                                         {"name": "nodevalue"}, 
                                                                                         {"name": "match","param": "^\\s*(.*?)\\s*$"},
                                                                                         {"name": "concatafter", "param": " ("}, 
                                                                                         {"name": "concatafter", "param": [{"name": "init"}, {"name": "func","param": "usernamebyhref"}]}, 
                                                                                         {"name": "concatafter", "param": ")"}], 
                                                                                         "param":[{"name": "init"}, {"name": "in"}]
                                                                                         } ]}],
    "getrootlink": [{ "rootlink": [{"name": "match", "param": "^([^?]*)" }]  }],        // входные данные тут - не DOM элемент, а текст ссылки!
    "gettext": [{ "doctcondition": [{"name": "iseq","param": "1"}], "eventtexts" : [ {"name": "ismobile"}, {"name": "if", "altparam": [
        {"name": "init"}, {"name": "up","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "reply_content"}]}}, 
        {"name": "down","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "reply_text"}]}},
        {"name": "in"}, {"name": "set", "param": "evtext"}, {"name": "const", "param": ""}, {"name": "set", "param": "evtitle"},
        {"name": "return", "param": "values"}
            ], "param": [{"name": "const", "param": ""}, {"name": "set", "param": "evtitle"}, {"name": "init"},
                         {"name": "up","param": {"case": [{"name": "classcontains","param": "vkitCommentBase__in--9swaG"}]}}, 
                         {"name": "down","param": {"case": [{"name": "classcontains","param": "vkitFeedShowMoreText__text--0wZYb"}]}}, 
                         {"name": "in"}, {"name": "set", "param": "evtext"}, {"name": "return", "param": "values"}]
          },
        ]},
                { "doctcondition": [{"name": "iseq","param": "2"}], "eventtexts" : [ {"name": "ismobile"}, {"name": "if", "altparam": [
        {"name": "init"}, {"name": "up","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "mv_info"}]}}, 
        {"name": "iseq","param": null},
        {"name": "if", 
            "param":[{"name": "const", "param": ""},
                     {"name": "set", "param": "evtext"},
                     {"name": "set", "param": "evtitle"},
                     {"name": "init"},
                     {"name": "up","param": {"case": [ {"name": "classcontains","param": "wl_post"} ] } },
                     {"name": "set", "param": "postblock"},
                     {"name": "iseq","param": null},
                     {"name": "if", "param": [ {"name": "init"}, {"name": "up","param": {"case": [ {"name": "classcontains","param": "_post_content"} ] } },
                                               {"name": "set", "param": "postblock"} ] },
                     {"name": "get", "param": "postblock"},
                     {"name": "down","param": {"case": [ {"name": "classcontains","param": "wall_post_text_wrapper"} ] } },
                     {"name": "set", "param": "textblock"},
                     {"name": "iseq","param": null},
                     {"name": "if", "altparam": [{"name": "get", "param": "textblock"},
                                                 {"name": "in"}, {"name": "set", "param": "evtext"} ],
                                    "param": [{"name": "get", "param": "postblock"},
                                                {"name": "down","param": {"case": [ {"name": "classcontains","param": "MediaGrid__imageSingle"} ] } },
                                                {"name": "set", "param": "imgblock"},
                                                {"name": "iseq","param": null},
                                                {"name": "if", "altparam": [
                                                  {"name": "get", "param": "imgblock"},
                                                  {"name": "attr", "param": "src"},
                                                  {"name": "set", "param": "evtext"}
                                                  ]}
                                                ] },
                    {"name": "return", "param": "values"}
                     
            ],
            "altparam": [
                {"name": "down","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "mv_title"}]}}, 
                {"name": "set", "param": "mvtitleblock"},
                {"name": "in"}, {"name": "set", "param": "evtitle"}, 
                {"name": "get", "param": "mvtitleblock"},
                {"name": "down","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "cant_edit"}]}}, 
                {"name": "in"}, {"name": "set", "param": "evtext"}, {"name": "return", "param": "values"}
                ]
              } ],
        "param":[ {"name": "init"}, {"name": "up","param": {"case": [{"name": "attr","param": "class"}, {"name": "test","param": "vkitGroup__group--lbf33"}]}},
                  {"name": "down","param": {"case": [{"name": "attr","param": "data-testid"}, {"name": "test","param": "post-content-container"}]}},
                  {"name": "in"}, {"name": "set", "param": "evtext"},
                  {"name": "const", "param": ""}, {"name": "set", "param": "evtitle"}, {"name": "return", "param": "values"} ] }    // MOBILE text extractor
            ]
          }
        ],
    "isnested": [{"name": "accept"}, {"name": "get", "param": "candidate"}, {"name": "test", "param": [{"name": "get", "param": "root"}]}]
    }       // functions
}

AllSocProcs.set("ВК", vkInstruct);
