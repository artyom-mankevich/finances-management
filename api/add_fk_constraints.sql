-- accounts_accountsettings
alter table accounts_accountsettings
    drop constraint accounts_accountsett_main_currency_id_26f90127_fk_wallets_c;

alter table accounts_accountsettings
    add constraint accounts_accountsett_main_currency_id_26f90127_fk_wallets_c
        foreign key (main_currency_id) references wallets_currency
            on delete cascade
            deferrable initially deferred;

alter table accounts_accountsettings
    drop constraint accounts_accountsett_start_page_id_88c1ca8c_fk_accounts_;

alter table accounts_accountsettings
    add constraint accounts_accountsett_start_page_id_88c1ca8c_fk_accounts_
        foreign key (start_page_id) references accounts_startpage
            on delete cascade
            deferrable initially deferred;

-- investments_investment
alter table investments_investment
    drop constraint investments_investment_wallet_id_fd9b92b1_fk_wallets_wallet_id;

alter table investments_investment
    add constraint investments_investment_wallet_id_fd9b92b1_fk_wallets_wallet_id
        foreign key (wallet_id) references wallets_wallet
            on delete cascade
            deferrable initially deferred;

-- investments_stock
alter table investments_stock
    drop constraint investments_stock_ticker_id_4820cd55_fk_investments_ticker_code;

alter table investments_stock
    add constraint investments_stock_ticker_id_4820cd55_fk_investments_ticker_code
        foreign key (ticker_id) references investments_ticker
            on delete cascade
            deferrable initially deferred;

-- news_filter_languages
alter table news_filter_languages
    drop constraint news_filter_language_newsfilter_id_f6fabad9_fk_news_news;

alter table news_filter_languages
    add constraint news_filter_language_newsfilter_id_f6fabad9_fk_news_news
        foreign key (newsfilter_id) references news_newsfilter
            on delete cascade
            deferrable initially deferred;

alter table news_filter_languages
    drop constraint news_filter_language_newslanguage_id_4971ae7d_fk_news_news;

alter table news_filter_languages
    add constraint news_filter_language_newslanguage_id_4971ae7d_fk_news_news
        foreign key (newslanguage_id) references news_newslanguage
            on delete cascade
            deferrable initially deferred;

-- news_filter_tickers
alter table news_filter_tickers
    drop constraint news_filter_tickers_newsfilter_id_082a9638_fk_news_news;

alter table news_filter_tickers
    add constraint news_filter_tickers_newsfilter_id_082a9638_fk_news_news
        foreign key (newsfilter_id) references news_newsfilter
            on delete cascade
            deferrable initially deferred;

alter table news_filter_tickers
    drop constraint news_filter_tickers_ticker_id_c0da232c_fk_investmen;

alter table news_filter_tickers
    add constraint news_filter_tickers_ticker_id_c0da232c_fk_investmen
        foreign key (ticker_id) references investments_ticker
            on delete cascade
            deferrable initially deferred;

-- wallets_debt
alter table wallets_debt
    drop constraint wallets_debt_wallet_id_39721d2f_fk_wallets_wallet_id;

alter table wallets_debt
    add constraint wallets_debt_wallet_id_39721d2f_fk_wallets_wallet_id
        foreign key (wallet_id) references wallets_wallet
            on delete cascade
            deferrable initially deferred;

-- wallets_transactioncategory
alter table wallets_transactioncategory
    drop constraint wallets_transactionc_icon_id_3ef9f257_fk_decoratio;

alter table wallets_transactioncategory
    add constraint wallets_transactionc_icon_id_3ef9f257_fk_decoratio
        foreign key (icon_id) references decorations_icon
            on delete cascade
            deferrable initially deferred;

alter table wallets_transactioncategory
    drop constraint wallets_transactionc_color_id_c8912b30_fk_decoratio;

alter table wallets_transactioncategory
    add constraint wallets_transactionc_color_id_c8912b30_fk_decoratio
        foreign key (color_id) references decorations_color
            on delete cascade
            deferrable initially deferred;

-- wallets_transaction
alter table wallets_transaction
    drop constraint wallets_transaction_category_id_f7f666fd_fk_wallets_t;

alter table wallets_transaction
    add constraint wallets_transaction_category_id_f7f666fd_fk_wallets_t
        foreign key (category_id) references wallets_transactioncategory
            on delete cascade
            deferrable initially deferred;

alter table wallets_transaction
    drop constraint wallets_transaction_source_wallet_id_7abc2933_fk_wallets_w;

alter table wallets_transaction
    add constraint wallets_transaction_source_wallet_id_7abc2933_fk_wallets_w
        foreign key (source_wallet_id) references wallets_wallet
            on delete cascade
            deferrable initially deferred;

alter table wallets_transaction
    drop constraint wallets_transaction_target_wallet_id_8e941cae_fk_wallets_w;

alter table wallets_transaction
    add constraint wallets_transaction_target_wallet_id_8e941cae_fk_wallets_w
        foreign key (target_wallet_id) references wallets_wallet
            on delete cascade
            deferrable initially deferred;

-- wallets_wallet
alter table wallets_wallet
    drop constraint wallets_wallet_color_id_4faf01ec_fk_decorations_color_hex_code;

alter table wallets_wallet
    add constraint wallets_wallet_color_id_4faf01ec_fk_decorations_color_hex_code
        foreign key (color_id) references decorations_color
            on delete cascade
            deferrable initially deferred;

alter table wallets_wallet
    drop constraint wallets_wallet_currency_id_4181fde6_fk_wallets_currency_code;

alter table wallets_wallet
    add constraint wallets_wallet_currency_id_4181fde6_fk_wallets_currency_code
        foreign key (currency_id) references wallets_currency
            on delete cascade
            deferrable initially deferred;

-- wallets_walletlog
alter table wallets_walletlog
    drop constraint wallets_walletlog_wallet_id_4599341b_fk_wallets_wallet_id;

alter table wallets_walletlog
    add constraint wallets_walletlog_wallet_id_4599341b_fk_wallets_wallet_id
        foreign key (wallet_id) references wallets_wallet
            on delete cascade
            deferrable initially deferred;
