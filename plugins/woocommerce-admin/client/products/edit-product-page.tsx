/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { recordEvent } from '@woocommerce/tracks';
import { useEffect, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Form, Spinner, FormRef } from '@woocommerce/components';
import {
	PartialProduct,
	Product,
	PRODUCTS_STORE_NAME,
	WCDataSelector,
} from '@woocommerce/data';
import { useParams } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { ProductFormLayout } from './layout/product-form-layout';
import { ProductFormActions } from './product-form-actions';
import { ProductDetailsSection } from './sections/product-details-section';
import './product-page.scss';

const EditProductPage: React.FC = () => {
	const { productId } = useParams();
	const previousProductRef = useRef< PartialProduct >();
	const formRef = useRef< FormRef< Partial< Product > > >( null );
	const { product, isLoading, isPendingAction } = useSelect(
		( select: WCDataSelector ) => {
			const { getProduct, hasFinishedResolution, isPending } =
				select( PRODUCTS_STORE_NAME );
			if ( productId ) {
				return {
					product: getProduct( parseInt( productId, 10 ), undefined ),
					isLoading: ! hasFinishedResolution( 'getProduct', [
						parseInt( productId, 10 ),
					] ),
					isPendingAction:
						isPending( 'createProduct' ) ||
						isPending(
							'deleteProduct',
							parseInt( productId, 10 )
						) ||
						isPending( 'updateProduct', parseInt( productId, 10 ) ),
				};
			}
			return {
				isLoading: false,
				isPendingAction: false,
			};
		}
	);

	useEffect( () => {
		// used for determening the wasDeletedUsingAction condition.
		if (
			previousProductRef.current &&
			product &&
			previousProductRef.current.id !== product.id &&
			formRef.current
		) {
			formRef.current.resetForm( product );
		}
		previousProductRef.current = product;
	}, [ product ] );

	useEffect( () => {
		recordEvent( 'view_new_product_management_experience' );
	}, [] );

	const wasDeletedUsingAction =
		previousProductRef.current?.id === product?.id &&
		previousProductRef.current?.status !== 'trash' &&
		product?.status === 'trash';

	return (
		<div className="woocommerce-edit-product">
			{ isLoading && ! product ? (
				<div className="woocommerce-edit-product__spinner">
					<Spinner />
				</div>
			) : null }
			{ product &&
				product.status === 'trash' &&
				! isPendingAction &&
				! wasDeletedUsingAction && (
					<ProductFormLayout>
						<div className="woocommerce-edit-product__error">
							{ __(
								'You cannot edit this item because it is in the Trash. Please restore it and try again.',
								'woocommerce'
							) }
						</div>
					</ProductFormLayout>
				) }
			{ product &&
				( product.status !== 'trash' || wasDeletedUsingAction ) && (
					<Form< Partial< Product > >
						ref={ formRef }
						initialValues={ product || {} }
						errors={ {} }
					>
						<ProductFormLayout>
							<ProductDetailsSection />

							<ProductFormActions />
						</ProductFormLayout>
					</Form>
				) }
		</div>
	);
};

export default EditProductPage;