import { Dropdown, IconButton, useTheme } from '@takaro/lib-components';
import { DeleteImperativeHandle } from '../../components/dialogs';
import { CategoryDeleteDialog } from '../../components/dialogs/CategoryDeleteDialog';
import { FC, useRef, useState, MouseEvent } from 'react';
import { AiOutlineMenu as MenuIcon, AiOutlineDelete as DeleteIcon, AiOutlineEdit as EditIcon } from 'react-icons/ai';
import { ShopCategoryOutputDTO } from '@takaro/apiclient';
import { useNavigate } from '@tanstack/react-router';

interface CategoryActionsProps {
  category: ShopCategoryOutputDTO;
  gameServerId: string;
}

export const CategoryActions: FC<CategoryActionsProps> = ({ category, gameServerId }) => {
  const theme = useTheme();
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const categoryDeleteDialogRef = useRef<DeleteImperativeHandle>(null);
  const navigate = useNavigate();

  const handleOnDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.shiftKey) {
      categoryDeleteDialogRef.current?.triggerDelete();
    } else {
      setOpenDeleteDialog(true);
    }
  };

  const handleOnEditClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigate({
      to: '/gameserver/$gameServerId/shop/categories/$categoryId/update',
      params: { categoryId: category.id, gameServerId: gameServerId },
    });
  };

  return (
    <>
      <CategoryDeleteDialog
        ref={categoryDeleteDialogRef}
        category={category}
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        initialOpen={false}
      />
      <Dropdown>
        <Dropdown.Trigger asChild>
          <IconButton icon={<MenuIcon />} ariaLabel="Actions" />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Menu.Group>
            <Dropdown.Menu.Item icon={<EditIcon />} label="Edit Category" onClick={handleOnEditClick} />
            <Dropdown.Menu.Item
              icon={<DeleteIcon fill={theme.colors.error} />}
              label="Delete Category"
              onClick={handleOnDeleteClick}
            />
          </Dropdown.Menu.Group>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};
