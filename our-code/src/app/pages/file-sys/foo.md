this.fileService.getCurrentFilesys(this.workspaceId, 0).subscribe({
      next: (res) => {
        console.log(res);
        const items = <{ id: number, name: string, type: string }[]> res;
        for (let item of items) {
          let node: TreeNode = {
            data: {
              name: item.name,
              type: item.type,
            },
            leaf: item.type === 'file' ? true : false
          };
          this.files.push(node);
        }
      },
      error: (err) => {
        this.error = err.error.error;
      },
    });

