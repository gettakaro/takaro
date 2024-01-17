#!/bin/sh
# ref: https://help.github.com/articles/adding-an-existing-project-to-github-using-the-command-line/
#
# Usage example: /bin/sh ./git_push.sh wing328 openapi-petstore-perl "minor update" "gitlab.com"

git_user_id=$1 # Git user ID
git_repo_id=$2 # Git repository ID
release_note=$3 # Release note
git_host=$4 # Git host

if [ "$git_host" = "" ]; then
    git_host="github.com"
    echo "[INFO] No command line input provided. Set \$git_host to $git_host"
fi

if [ "$git_user_id" = "" ]; then
    echo "[ERROR] Git user ID is not provided. Please provide the Git user ID as a command line argument." exit 1
    echo "[INFO] No command line input provided. Set \$git_user_id to $git_user_id"
fi

if [ "$git_repo_id" = "" ]; then
    echo "[ERROR] Git repository ID is not provided. Please provide the Git repository ID as a command line argument." exit 1
    echo "[INFO] No command line input provided. Set \$git_repo_id to $git_repo_id"
fi

if [ "$release_note" = "" ]; then
    echo "[ERROR] Release note is not provided. Please provide the release note as a command line argument." exit 1
    echo "[INFO] No command line input provided. Set \$release_note to $release_note"
fi

# Initialize the local directory as a Git repository
git_remote=$(git remote)
if [ "$git_remote" = "" ]; then
    if [ "$GIT_TOKEN" = "" ]; then
        echo "[ERROR] Remote repository is not defined and \$GIT_TOKEN (environment variable) is not set. Please set the remote repository URL manually or provide the \$GIT_TOKEN environment variable."
        exit 1
    else
        git remote add origin https://${git_user_id}:"${GIT_TOKEN}"@${git_host}/${git_user_id}/${git_repo_id}.git
    fi
fi

&

# Adds the files in the local repository and stages them for commit.
git add .

# Commits the tracked changes and prepares them to be pushed to a remote repository.
git commit -m "$release_note"

# Sets the new remote
git_remote=$(git remote)
if [ "$git_remote" = "" ]; then
    if [ "$GIT_TOKEN" = "" ]; then
        echo "[ERROR] Remote repository is not defined and \$GIT_TOKEN (environment variable) is not set. Please set the remote repository URL manually or provide the \$GIT_TOKEN environment variable."
        exit 1
    else
        git remote add origin https://${git_host}/${git_user_id}:\
if [ "$git_remote" = "" ]; then # git remote not defined

    if [ "$GIT_TOKEN" = "" ]; then
        echo "[INFO] \$GIT_TOKEN (environment variable) is not set. Using the git credential in your environment."
        git remote add origin https://${git_host}/${git_user_id}/${git_repo_id}.git
    else
        git remote add origin https://${git_user_id}:"${GIT_TOKEN}"@${git_host}/${git_user_id}/${git_repo_id}.git
    fi

fi

git pull origin master

# Pushes (Forces) the changes in the local repository up to the remote repository
echo "Git pushing to https://${git_host}/${git_user_id}/${git_repo_id}.git"
git push origin master 2>&1 | grep -v 'To https'
