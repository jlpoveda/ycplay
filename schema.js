watch : {
    'video_id': int,
    'created_at': datetime,
    'ip': string,
    'auto': boolean
};

search : {
    'term': string,
    'ip': string
}

user: {
    username: string,
    password: string,
    ...
    last_views: ['video_id', 'video_id',...]
    likes: ['video_id','video_id','video_id','video_id'...]
    ]
}

video: {
    _id: video_id,
    title: string,
    created_at: datetime
}
