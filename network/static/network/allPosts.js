document.addEventListener('DOMContentLoaded', () => {

    const aperfil = document.querySelector("#aperfil")
    
    if(aperfil) {
        aperfil.addEventListener('click', function(event) {
            load_my_perfil(1)
            event.preventDefault()
        }) 
    }

    document.querySelector("#aallposts").addEventListener('click', function(event) {
        load_all(1)
        event.preventDefault()
    })

    document.querySelector("#aallposts-following").addEventListener('click', function(event) {
        load_all_following(1)
        event.preventDefault()
    })

    document.querySelector("#postform").onsubmit = event => {

        _body = document.querySelector("#postbody")
        fetch("/newpost", {
            method: "POST",
            body: JSON.stringify({
                post_body: _body.value
            })
        })
        .then(res => res.json())
        .then(data => {
            load_all(1)
        })
        
        _body.value = "";
        event.preventDefault();
    }



    load_all(1)
})

function set_current_div (id) {
    document.querySelector('#perfil').className = 'none';
    document.querySelector('#allposts').className = 'none';
    document.querySelector('#allposts-following').className = 'none';

    document.querySelector(id).className = 'main';
}

function get_pagination(idtype, numpages, current_page, is_my_perfil) {
    current_page = parseInt(current_page)
    const _pagination = document.querySelector(idtype)
    _pagination.innerHTML = "";

    const _lib = document.createElement("li")
    _lib.className = "page-item"
    const _ab = document.createElement("a")
    _ab.innerHTML = "Previous"
    _ab.href = ""
    _ab.className = "page-link bg-dark text-light"
    _lib.append(_ab)
    if(current_page == 1) {
        _lib.className += " disabled"
    }
    else {
        _ab.onclick = event => {
            switch(idtype) {
                case "#pagination-allposts":
                    load_all(current_page - 1);
                    break;
                case "pagination-allposts-following":
                    load_all_following(current_page - 1);
                    break;
                case "pagination-perfil":
                    if(is_my_perfil) load_my_perfil(current_page - 1);
                    else load_perfil(current_page - 1); 
                    break;
            }
            window.scrollTo(0,0)
            event.preventDefault()
        }
    }
    _pagination.append(_lib)

    for (let i = 1; i <= numpages; i++) {
        const _li = document.createElement("li")
        if(i == current_page) {
            const _span = document.createElement("span")
            _span.innerHTML = i
            _span.className = "page-link"
            _li.className = "page-item active bg-dark text-light"
            _li.append(_span)
        }
        else {
            _li.className = "page-item"
            const _aa = document.createElement("a")
            _aa.innerHTML = i
            _aa.className = "page-link bg-dark text-light"
            _aa.href = ""
            _li.onclick = event => {
                switch(idtype) {
                    case "#pagination-allposts":
                        load_all(i);
                        break;
                    case "pagination-allposts-following":
                        load_all_following(i);
                        break;
                    case "pagination-perfil":
                        if(is_my_perfil) load_my_perfil(i);
                        else load_perfil(i); 
                        break;
                }
                window.scrollTo(0,0)
                event.preventDefault()
            }
            _li.append(_aa)
        }
        _pagination.append(_li)
    }
    
    const _liaf = document.createElement("li")
    _liaf.className = "page-item"
    const _aaf = document.createElement("a")
    _aaf.innerHTML = "Next"
    _aaf.href = ""
    _aaf.className = "page-link bg-dark text-light"
    _liaf.append(_aaf)
    if(current_page == numpages) {
        _liaf.className += " disabled"
    }
    else {
        _liaf.onclick = event => {
            switch(idtype) {
                case "#pagination-allposts":
                    load_all(current_page + 1);
                    break;
                case "pagination-allposts-following":
                    load_all_following(current_page + 1);
                    break;
                case "pagination-perfil":
                    if(is_my_perfil) load_my_perfil(current_page + 1);
                    else load_perfil(current_page + 1); 
                    break;
            }
            window.scrollTo(0,0)
            event.preventDefault()
        }
    }
    _pagination.append(_liaf)
}

function load_all_following(page) {
    set_current_div("#allposts-following")
    
    fetch(`/allpostsfollowing?page=${page}`, {
        method: "GET",
    })
    .then(res => res.json())
    .then(data => {
        if(!data.error) {
            const _maindiv = document.querySelector("#cards-following");
            _maindiv.innerHTML = ""
            data.posts.forEach(el => {
                _maindiv.append(create_post_card(el))
            });
            get_pagination("#pagination-allposts-following", data.numpages, data.page, false)
        }
    })
}

function load_all(page) {
    set_current_div("#allposts")
    
    fetch(`/allposts?page=${page}`, {
        method: "GET",
    })
    .then(res => res.json())
    .then(data => {
        if(!data.error) {
            const _maindiv = document.querySelector("#cards");
            _maindiv.innerHTML = ""
            data.posts.forEach(el => {
                _maindiv.append(create_post_card(el))
            });
            get_pagination("#pagination-allposts", data.numpages, data.page, false)
        }
    })
}

function load_my_perfil(page) {
    set_current_div("#perfil")

    _buttonFollow = document.querySelector("#perfil-follow");
    _buttonFollow.className = "none"

    fetch(`/perfil?page=${page}`, {
        method: "GET",
    })
    .then(res => res.json())
    .then(data => {
        if(!data.error) {
            document.querySelector("#perfil-username").innerHTML = data.user
            _followers = document.querySelector("#perfil-followers")
            _followers.innerHTML = `<strong>${data.followers.length}</strong><br>followers`

            _followers = document.querySelector("#perfil-followings")
            _followers.innerHTML = `<strong>${data.followings.length}</strong><br>following`

            const _maindiv = document.querySelector("#cards-perfil");
            _maindiv.innerHTML = ""
            data.posts.forEach(el => {
                _maindiv.append(create_post_card(el))
            });
            get_pagination("#pagination-perfil", data.numpages, data.page, true)
        }
    })
}

function load_perfil(username, page) {
    set_current_div("#perfil")

    _buttonFollow = document.querySelector("#perfil-follow");


    fetch(`/getperfil/${username}?page=${page}`, {
        method: "GET",
    })
    .then(res => res.json())
    .then(data => {
        if(!data.error) {
            if(data.ismyperfil) {
                load_my_perfil()
                return;
            }
            if(data.following) {
                _buttonFollow.className = "btn btn-sm btn-primary"
                _buttonFollow.innerHTML = "Unfollow"
            }
            else {
                _buttonFollow.className = "btn btn-sm btn-outline-primary"
                _buttonFollow.innerHTML = "Follow"
            }

            _followers = document.querySelector("#perfil-followings")
            _followers.innerHTML = `<strong>${data.followings.length}</strong><br>following`


            document.querySelector("#perfil-username").innerHTML = username

            _followers = document.querySelector("#perfil-followers")
            _followers.innerHTML = `<strong>${data.followers.length}</strong><br>followers`

            let contrl = data.following ? 1 : 0

            _buttonFollow.onclick = () => {
                if(data.following) {
                    data.following = false
                    _followers.innerHTML = `<strong>${data.followers.length > 0 ? data.followers.length - contrl : 0}</strong><br>followers`
                    _buttonFollow.innerHTML = "Follow"
                    _buttonFollow.className = "btn btn-sm btn-outline-primary"
                    fetch('/followunfollow', {
                        method: "POST",
                        body: JSON.stringify({
                            "username": username,
                            "follow": false
                        })
                    })
                    .then(resp => {
                        if(resp.status != 200) {
                            data.following = true
                            _followers.innerHTML = `<strong>${data.likes.length - contrl}</strong><br>followers`
                        }
                    })
                }
                else {
                    data.following = true
                    _followers.innerHTML = `<strong>${data.followers.length + 1 - contrl}</strong><br>followers`
                    _buttonFollow.className = "btn btn-sm btn-primary"
                    _buttonFollow.innerHTML = "Unfollow"
                    fetch('/followunfollow', {
                        method: "POST",
                        body: JSON.stringify({
                            "username": username,
                            "follow": true
                        })
                    })
                    .then(resp => {
                        if(resp.status != 200) {
                            data.following = false
                            _followers.innerHTML = `<strong>${data.likes.length - contrl}</strong><br>followers`
                        }
                    })
                }
            }

            const _maindiv = document.querySelector("#cards-perfil");
            _maindiv.innerHTML = ""
            data.posts.forEach(el => {
                _maindiv.append(create_post_card(el))
            });
            get_pagination("#pagination-perfil", data.numpages, data.page, false)
        }
    })
}

function create_post_card(data) {

    let contrl = data.liked ? 1 : 0;
    const _a4 = document.createElement('a')
    _a4.innerHTML = data.post.user
    _a4.className = "a4"
    _a4.addEventListener('click', function(event) {
        load_perfil(data.post.user, 1)
        event.preventDefault()
    })

    
    const _span1 = document.createElement('span')
    _span1.innerHTML = `<span><strong>${data.post.body}</strong><br></span>`;
    

    const _span3 =document.createElement("span")
    _span3.innerText = data.post.timestamp
    
    const _span2 = document.createElement("span")
    _span2.innerHTML = ` ${data.likes.length}`
    
    const _button = document.createElement('button');
    _button.className = "btn btn-sm btn-outline-danger"
    const _i = document.createElement('i');
    if(data.liked) {
        _i.className="fa fa-heart"
    }
    else {
        _i.className = "fa fa-heart-o"
    }
    _button.append(_i)
    _button.append(_span2)
    _button.onclick = () => {
        if(data.liked) {
            _i.className = "fa fa-heart-o"
            data.liked = false
            _span2.innerHTML = ` ${data.likes.length > 0 ? data.likes.length - contrl : 0}`
            fetch('/likeunlike', {
                method: "POST",
                body: JSON.stringify({
                    "postid": data.post.id,
                    "liked": false
                })
            })
            .then(resp => {
                if(resp.status != 200) {
                    _i.className = "fa fa-heart"
                    data.liked = true
                    _span2.innerHTML = ` ${data.likes.length - contrl}`
                }
            })
        }
        else {
            _i.className="fa fa-heart"
            data.liked = true
            _span2.innerHTML = ` ${data.likes.length + 1 - contrl}`
            fetch('/likeunlike', {
                method: "POST",
                body: JSON.stringify({
                    "postid": data.post.id,
                    "liked": true
                })
            })
            .then(resp => {
                if(resp.status != 200) {
                    _i.className="fa fa-heart-o"
                    contrl = 0;
                    data.liked = false
                    _span2.innerHTML = ` ${data.likes.length + contrl}`
                }
            })
        }
    }
    
    const _div = document.createElement("div")
    _div.className = "card"
    _div.append(_a4);
    
    if(data.isminepost) {
        const _a = document.createElement('a')
        const _form = document.createElement("form");
        const _textarea = document.createElement("textarea");
        const _submit = document.createElement("button");
        const _cancel = document.createElement("button");
        const _div_form = document.createElement("div")
        _form.append(_textarea)
        _div_form.append(_submit)
        _div_form.append(_cancel)
        _form.append(_div_form)
        _form.className = "none"
        _submit.innerHTML = "Confirm"
        _submit.className = "btn btn-sm btn-outline-primary"
        _cancel.innerHTML = "Cancel"
        _cancel.className = "btn btn-sm btn-outline-danger"

        _a.innerText = "Edit";
        _a.href = ""
        _a.onclick = event => {
            _a.className = "none"
            _form.className = "form-edit"
            _textarea.value = data.post.body
            event.preventDefault()
        }
        _cancel.onclick = event => {
            _a.className = ""
            _form.className = "none"
            event.preventDefault()
            
        }
        _submit.onclick = event => {
            fetch("/updatepost", {
                method: "POST",
                body: JSON.stringify({
                    postid: data.post.id,
                    body: _textarea.value
                })
            })
            .then(resp => {
                if(resp.status == 200) {
                    data.post.body = _textarea.value
                    _a.className = ""
                    _form.className = "none"
                    _span1.innerHTML = `<span><strong>${data.post.body}</strong><br></span>`;
                }
            })
            event.preventDefault()
        }

        _div.append(_a);
        _div.append(_form)
    }
    _div.append(_span1);
    _div.append(_span3);
    _div.append(_button);

    return _div
}